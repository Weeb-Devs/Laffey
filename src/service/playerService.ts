import {Kazagumo, type KazagumoPlayer, type KazagumoTrack, Plugins} from "kazagumo";
import type {Laffey} from "../Laffey.js";
import {Connectors} from "shoukaku";
import fs from "node:fs";
import * as path from "node:path";
import type {PlayerEvent} from "../events/player/playerEvent.js";
import {Logger} from "../utils/logger.js";
import type {PlayerRateLimit} from "../events/player/playerException.js";
import {ConfigHandler} from "../utils/config.js";
import type {IPlayer} from "../database/IPlayer.js";
import type {ButtonInteraction, Interaction, Message, User} from "discord.js";
import {PlayerButtons} from "../utils/playerButtons.js";
import {ActionRowBuilder} from "@discordjs/builders";
import {EmbedBuilder} from "../builder/embedBuilder.js";
import {Sharp} from "../utils/sharp.js";
import {ProgressBar} from "../utils/progressBar.js";

export class PlayerService extends Kazagumo {
    private nowPlayings = new Map<string, NodeJS.Timeout>();

    constructor(public readonly client: Laffey) {
        super({
            defaultSearchEngine: "youtube",
            send: (guildId, payload) => client.guilds.cache.get(guildId)?.shard.send(payload),
            plugins: [new Plugins.PlayerMoved(client)]
        }, new Connectors.DiscordJS(client), ConfigHandler.nodes);
    }

    public async prepare() {
        await this.listenEvents();
    }

    public async listenEvents() {
        const basePath = path.join("src", "events", "player");
        const events = fs.readdirSync(basePath);
        for (const event of events) {
            if (event.startsWith("playerEvent")) continue;
            const eventPath = path.join(process.cwd(), basePath, event);
            const modUrl = `file://${eventPath}?t=${Date.now()}`;
            const mod = await import(modUrl);
            const ev = new mod.default(this) as PlayerEvent;
            Logger.debug(`Loaded ${ev.name} ${ev.type} event`, 'Kazagumo');
            if (ev.once) {
                if (ev.type === "shoukaku") this.shoukaku.once(ev.name as any, (...args: any[]) => ev.execute(...args));
                else this.once(ev.name as any, (...args: any[]) => ev.execute(...args));
            } else {
                if (ev.type === "shoukaku") this.shoukaku.on(ev.name as any, (...args: any[]) => ev.execute(...args));
                else this.on(ev.name as any, (...args: any[]) => ev.execute(...args));
            }
        }
        Logger.log(`Loaded ${events.length} events`, 'Kazagumo');
    }

    public async autoResume() {
        const players = await this.client.db.db.getPlayers();
        Logger.log(`Found ${players.length} players to resume`, 'Kazagumo');
        if (!players.length) return;

        await this.waitForReadyNode(10);

        for (const dbPlayer of players) await this.resumePlayerFromDb(dbPlayer);
    }

    private hasReadyNode(): boolean {
        return !!this.shoukaku.nodes.values().toArray().find(x => x.state === 1);
    }

    private async waitForReadyNode(retries: number) {
        let tries = retries;
        while (tries > 0) {
            if (this.hasReadyNode()) {
                Logger.log(`Node is ready, resuming players...`, 'Kazagumo');
                break;
            }
            Logger.log(`Waiting for ${tries} seconds for a node to be ready...`, 'Kazagumo');
            await new Promise(resolve => setTimeout(resolve, 1000));
            tries--;
        }
    }

    private async resumePlayerFromDb(dbPlayer: IPlayer) {
        const guild = this.client.guilds.cache.get(dbPlayer.guildId);
        if (!guild) {
            Logger.error(`Guild not found for player ${dbPlayer.guildId}`, 'Kazagumo');
            await this.client.db.db.deletePlayer(dbPlayer.guildId);
            return;
        }

        try {
            Logger.log(`Resuming player ${dbPlayer.guildId}`, 'Kazagumo');
            const existingPlayer = this.getPlayer(dbPlayer.guildId);
            if (existingPlayer) return Logger.error(`Player already exists for guild ${dbPlayer.guildId}`, 'Kazagumo');
            const voiceChannel = guild.channels.cache.get(dbPlayer.voiceId!);
            if (!voiceChannel) {
                Logger.error(`Voice channel not found for guild ${dbPlayer.guildId}`, 'Kazagumo');
                await this.client.db.db.deletePlayer(dbPlayer.guildId);
                return;
            }
            const player = await this.createPlayer({
                guildId: dbPlayer.guildId,
                voiceId: voiceChannel.id,
                deaf: true,
            });
            await this.applyDbState(player, dbPlayer);
            Logger.log(`Resumed player ${dbPlayer.guildId}`, 'Kazagumo');
        } catch (err) {
            Logger.errorStack(`Failed to resume player: ${err instanceof Error ? err.message : String(err)}`, 'Kazagumo', err as Error);
            await this.client.db.db.deletePlayer(dbPlayer.guildId);
        }
    }

    private async applyDbState(player: KazagumoPlayer, dbPlayer: IPlayer) {
        if (dbPlayer.textId) player.setTextChannel(dbPlayer.textId);
        if (dbPlayer.currentSong) player.queue.add(dbPlayer.currentSong);
        if (dbPlayer.queue.length > 0) player.queue.add(dbPlayer.queue);
        if (!player.playing && !player.paused) await player.play();
        if (dbPlayer.volume !== 100) await player.setVolume(dbPlayer.volume);
        if (dbPlayer.loop !== "none") player.setLoop(dbPlayer.loop as any);
        if (dbPlayer._24h) player.data.set("24h", true);
        if (dbPlayer.filters && Object.keys(dbPlayer.filters).length > 0)
            await player.shoukaku.setFilters(dbPlayer.filters);
    }

    public async handleInteraction(interaction: Interaction) {
        if (!interaction.isButton() || !interaction.guildId) return;
        const player = this.getPlayer(interaction.guildId);
        if (!player) return;
        const msg = player.data.get("message") as Message | undefined;
        if (!msg || interaction.message.id !== msg.id) return;

        const updated = await this.handlePlayerButton(interaction, player);
        if (updated === undefined) return;

        await this.updatePlayerMessage(interaction, player, updated);
    }

    private async handlePlayerButton(interaction: ButtonInteraction, player: KazagumoPlayer): Promise<boolean | undefined> {
        switch (interaction.customId) {
            case "pause": {
                if (player.paused) return;
                player.pause(true);
                return false;
            }
            case "play": {
                if (!player.paused) return;
                player.pause(false);
                return false;
            }
            case "skip": {
                if (!player.queue.current && !player.queue.length) return;
                player.skip();
                return true;
            }
            case "stop": {
                if (!player.playing && !player.queue.current) return;
                await player.shoukaku.stopTrack();
                player.queue.clear();
                return true;
            }
            case "previous": {
                if (!player.queue.previous.length) return;
                await player.play(player.getPrevious(true));
                return true;
            }
            case "loop":
            case "loop_queue":
            case "loop_track": {
                const newLoop = player.loop === "none" ? "queue" : player.loop === "queue" ? "track" : player.loop === "track" ? "none" : "none";
                player.setLoop(newLoop);
                return false;
            }
        }
    }

    private async updatePlayerMessage(interaction: ButtonInteraction, player: KazagumoPlayer, skipEdit: boolean) {
        if (!skipEdit) {
            await interaction.message.edit({
                embeds: [await this.getPlayerEmbed(player)],
                components: this.getPlayerComponents(player)
            });
        }
        await interaction.deferUpdate();
    }

    public static isPlayerRateLimited(player: KazagumoPlayer): boolean {
        const now = Date.now();
        const rateLimit = player.data.get("ratelimit.data") as PlayerRateLimit | undefined;

        if (!rateLimit?.blockedUntil) return false;

        if (now >= rateLimit.blockedUntil) {
            player.data.delete("ratelimit.data");
            return false;
        }

        return true;
    }

    public async getPlayerEmbed(player: KazagumoPlayer, _track?: KazagumoTrack) {
        const track = _track || player.queue.current || undefined;
        const playEmbed = new EmbedBuilder(undefined, "default", true)
            .setAuthor({name: "Now Playing"})
            .setDescription("No music is currently playing");
        if (!track) return playEmbed;

        this.applyTrackInfo(playEmbed, track, player.position);
        await this.applyTrackColor(playEmbed, track);
        this.applyFooterInfo(playEmbed, track, player.loop);

        return playEmbed;
    }

    private applyTrackInfo(playEmbed: EmbedBuilder, track: KazagumoTrack, position: number) {
        playEmbed.setDescription(`[${track.title}](${track.uri})${track.author ? ` - ${track.author}` : ''}`);
        if (track.thumbnail) playEmbed.setThumbnail(track.thumbnail);

        const current = track.isStream ? '◉ LIVE' : `${new Date(position).toISOString().slice(11, 19)}`;
        const end = track.isStream ? '◉ LIVE' : `${new Date(track.length!).toISOString().slice(11, 19)}`;
        const progress = ProgressBar.make(track.isStream ? 100 : position, track.length || 100, 20);
        playEmbed.data.description += `\n[${current}] ${progress} [${end}]`;
    }

    private async applyTrackColor(playEmbed: EmbedBuilder, track: KazagumoTrack) {
        const color = track.thumbnail ? await Sharp.getPaletteFromUrl(track.thumbnail).catch(() => undefined) : undefined;
        if (color?.length) playEmbed.setColor(color[0]!.rgb);
    }

    private applyFooterInfo(playEmbed: EmbedBuilder, track: KazagumoTrack, loop: string) {
        const requester = track.requester as User | undefined;
        if (requester) {
            playEmbed.data.footer = {text: `Requested by ${requester.tag}`};
            if (requester.avatar) playEmbed.data.footer.icon_url = `https://cdn.discordapp.com/avatars/${requester.id}/${requester.avatar}.webp`;
        }
        if (loop !== "none") {
            if (playEmbed.data.footer?.text) playEmbed.data.footer.text += ` | Loop: ${loop === "track" ? "Track" : "Queue"}`;
            else playEmbed.data.footer = {text: `Loop: ${loop === "track" ? "Track" : "Queue"}`};
        }
    }

    public startNowPlaying(_player: KazagumoPlayer) {
        if (this.nowPlayings.get(_player.guildId)) clearInterval(this.nowPlayings.get(_player.guildId));
        const interval = setInterval(async () => {
            const player = this.getPlayer(_player.guildId);
            if (!player || !player.queue.current) return clearInterval(interval);
            const msg = player.data.get("message") as Message | undefined;
            if (!msg) return clearInterval(interval);
            const embed = await this.getPlayerEmbed(player);
            const components = this.getPlayerComponents(player);
            await msg.edit({embeds: [embed], components}).catch(() => clearInterval(interval));
        }, 5000);
        this.nowPlayings.set(_player.guildId, interval);
    }

    public getPlayerComponents(player: KazagumoPlayer) {
        const controlActionRow = new ActionRowBuilder()
            .addComponents([
                PlayerButtons.loopButton(player.loop),
                PlayerButtons.previousButton(!player.queue.previous.length),
                PlayerButtons.playButton(!player.paused),
                PlayerButtons.skipButton(!player.queue.length),
                PlayerButtons.stopButton(!player.playing && !player.queue.current),
            ]);
        // const volumeActionRow = new ActionRowBuilder()
        //     .addComponents([
        //         PlayerButtons.volumeDown(player.volume === 0),
        //         player.volume === 0 ? PlayerButtons.volumeUnmute() : PlayerButtons.volumeMute(),
        //         PlayerButtons.volumeUp(player.volume >= 100),
        //     ]);

        return [controlActionRow.toJSON()];
    }

    public static registerPlayerTrigger(player: KazagumoPlayer): boolean {
        const now = Date.now();
        const rateLimit = player.data.get("ratelimit.data") as PlayerRateLimit | undefined;

        if (rateLimit?.blockedUntil) {
            if (now < rateLimit.blockedUntil) return true;
            player.data.delete("ratelimit.data");
        }

        const fresh = player.data.get("ratelimit.data") as PlayerRateLimit | undefined;
        if (!fresh) {
            player.data.set("ratelimit.data", {windowStart: now, count: 1});
            return false;
        }

        if (now - fresh.windowStart >= 1000) {
            player.data.set("ratelimit.data", {windowStart: now, count: 1});
            return false;
        }

        const newCount = fresh.count + 1;

        if (newCount >= 5) {
            player.data.set("ratelimit.data", {
                windowStart: fresh.windowStart,
                count: newCount,
                blockedUntil: now + 5000
            });
            return true;
        }

        player.data.set("ratelimit.data", {windowStart: fresh.windowStart, count: newCount});

        return false;
    }

    public static buildDbPlayer(player: KazagumoPlayer): IPlayer {
        return {
            guildId: player.guildId,
            voiceId: player.voiceId || undefined,
            textId: player.textId,
            _24h: player.data.get("24h") || false,
            loop: player.loop,
            volume: player.volume,
            filters: player.filters,
            currentSong: player.queue.current || undefined,
            queue: player.queue
        }
    }
}