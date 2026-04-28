import {Kazagumo} from "kazagumo";
import type {Laffey} from "../Laffey.js";
import {Connectors} from "shoukaku";
import {EmbedBuilder} from "@discordjs/builders";
import {TextChannel} from "discord.js";

export class PlayerService extends Kazagumo {
    constructor(private client: Laffey) {
        super({
            defaultSearchEngine: "youtube",
            send: (guildId, payload) => client.guilds.cache.get(guildId)?.shard.send(payload),
        }, new Connectors.DiscordJS(client), [{
            name: "Testing",
            url: "localhost:5050",
            auth: "REMOVED"
        }]);
    }

    public async prepare() {
        this.listenEvents();
    }

    public listenEvents() {
        this.shoukaku.on("ready", (name) => console.log(`[LAVALINK] => [STATUS] Lavalink ${name}: Ready!`));
        this.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, code: ${code}, reason: ${reason}`));
        this.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error`, error));
        this.shoukaku.on('disconnect', (name, count) => {
            const players = [...this.shoukaku.players.values()].filter(p => p.node.name === name);
            players.map(player => {
                this.destroyPlayer(player.guildId);
                player.destroy();
            });
            console.warn(`Lavalink ${name}: Disconnected (${count})`);
        });
        this.on('playerStart', async (player, track) => {
            if (!player.textId) return;
            const channel = this.client.channels.cache.get(player.textId);
            if (!channel || !(channel instanceof TextChannel)) return;

            const playEmbed = new EmbedBuilder()
                .setAuthor({name: "Now Playing"})
                .setDescription(`${track ? `[${track.title}](${track.uri}) [${track.requester}]` : 'Unknown'}`)
                .setColor(0x00C7FF)
            const msg = await channel.send({embeds: [playEmbed]}).catch(() => undefined);
            player.data.set('message', msg);
        });
        this.on('playerEnd', (player) => {
            if (player.data.get('message')) player.data.get('message').delete().catch(() => void 0);
        })
    }
}