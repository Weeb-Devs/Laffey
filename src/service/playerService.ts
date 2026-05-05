import {Kazagumo, type KazagumoPlayer} from "kazagumo";
import type {Laffey} from "../Laffey.js";
import {Connectors} from "shoukaku";
import fs from "node:fs";
import * as path from "node:path";
import type {PlayerEvent} from "../events/player/playerEvent.js";
import {Logger} from "../utils/logger.js";
import type {PlayerRateLimit} from "../events/player/playerException.js";
import {ConfigHandler} from "../utils/config.js";
import type {IPlayer} from "../database/IPlayer.js";

export class PlayerService extends Kazagumo {
    constructor(public readonly client: Laffey) {
        super({
            defaultSearchEngine: "youtube",
            send: (guildId, payload) => client.guilds.cache.get(guildId)?.shard.send(payload),
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
        let tries = 10;
        while (tries > 0) {
            if (this.shoukaku.nodes.values().toArray().find(x => x.state === 1)) {
                Logger.log(`Node is ready, resuming players...`, 'Kazagumo');
                break;
            }
            Logger.log(`Waiting for ${tries} seconds for a node to be ready...`, 'Kazagumo');
            await new Promise(resolve => setTimeout(resolve, 1000));
            tries--;
        }

        for (const dbPlayer of players) {
            const guild = this.client.guilds.cache.get(dbPlayer.guildId);
            if (!guild) {
                Logger.error(`Guild not found for player ${dbPlayer.guildId}`, 'Kazagumo');
                await this.client.db.db.deletePlayer(dbPlayer.guildId);
                continue;
            }
            try {
                Logger.log(`Resuming player ${dbPlayer.guildId}`, 'Kazagumo');
                const existingPlayer = this.getPlayer(dbPlayer.guildId);
                if (existingPlayer) {
                    Logger.error(`Player already exists for guild ${dbPlayer.guildId}`, 'Kazagumo');
                    continue;
                }
                const voiceChannel = guild.channels.cache.get(dbPlayer.voiceId!);
                if (!voiceChannel) {
                    Logger.error(`Voice channel not found for guild ${dbPlayer.guildId}`, 'Kazagumo');
                    await this.client.db.db.deletePlayer(dbPlayer.guildId);
                    continue;
                }
                const player = await this.createPlayer({
                    guildId: dbPlayer.guildId,
                    voiceId: voiceChannel.id,
                    deaf: true,
                });
                if (dbPlayer.textId) player.setTextChannel(dbPlayer.textId);
                if (dbPlayer.currentSong) player.queue.add(dbPlayer.currentSong);
                if (dbPlayer.queue.length > 0) player.queue.add(dbPlayer.queue);
                if (!player.playing && !player.paused) await player.play();
                if (dbPlayer.volume !== 100) await player.setVolume(dbPlayer.volume);
                if (dbPlayer.loop !== "none") player.setLoop(dbPlayer.loop as any);
                if (dbPlayer._24h) player.data.set("24h", true);
                if (dbPlayer.filters && Object.keys(dbPlayer.filters).length > 0)
                    await player.shoukaku.setFilters(dbPlayer.filters);
                Logger.log(`Resumed player ${dbPlayer.guildId}`, 'Kazagumo');
            } catch (err) {
                Logger.errorStack(`Failed to resume player: ${err instanceof Error ? err.message : String(err)}`, 'Kazagumo', err as Error);
                await this.client.db.db.deletePlayer(dbPlayer.guildId);
            }
        }
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