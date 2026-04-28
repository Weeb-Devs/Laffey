import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse, CommandResponseType} from "../commandResponse.js";
import {splitBar} from "string-progressbar";
import {KazagumoPlayer} from "kazagumo";
import {EmbedBuilder} from "discord.js";

export default class nowPlaying extends Command {
    constructor() {
        super('nowplaying', 'Check the current playing track');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guildId = ctx.guildId!;
        let player = ctx.client.player.players.get(guildId);
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!player.queue.current) return CommandResponse.error(`There\'s no music playing`);
        if (player.data.get("nowplaying")) {
            clearInterval(player.data.get("nowplaying"));
            player.data.get("nowplaying.msg")?.delete().catch(() => void 0);
        }

        let musicLength = player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.length || isNaN(player.queue.current.length)) ? null : player.queue.current.length),
            nowTime = (!player.position || isNaN(player.position)) ? null : player.position;

        const embed = (p: KazagumoPlayer, l: number | null, n: number | null) => {
            const current = p.queue.current;
            if (!current) return new EmbedBuilder().setTitle('Nowplaying - none');
            return new EmbedBuilder()
                .setTitle(`Nowplaying - ${current.title}`)
                .setURL(current.uri || null)
                .setThumbnail(current.thumbnail || 'https://i.imgur.com/E6IhRS4.png')
                .setDescription(`[${current.isStream ? '◉ LIVE' : `${new Date(p.position).toISOString().slice(11, 19)}`}]` +
                    splitBar(l ? Number(l) : 1, n ? Number(n) : 2, 26, '=', 'X')[0] +
                    `[${current.isStream ? '◉ LIVE' : `${new Date(current.length!).toISOString().slice(11, 19)}`}]`)
                .setFooter({text: `${new Date(l! - n!).toISOString().slice(11, 19) + ' left'}`})
                .setColor(0x00C7FF);
        }


        const interval = setInterval(() => {
            player = ctx.client.player.players.get(guildId);
            if (!player || !player.queue.current) return clearInterval(interval);

            let musicLength = player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.length || isNaN(player.queue.current.length)) ? null : player.queue.current.length);
            let nowTime = (!player.position || isNaN(player.position)) ? null : player.position;

            player.data.get("nowplaying.msg")
                ?.edit({embeds: [embed(player, musicLength, nowTime)]})
                .catch(() => clearInterval(interval));
        }, 5000);
        player.data.set("nowplaying", interval);

        return CommandResponse.success(embed(player, musicLength, nowTime), CommandResponseType.nowplaying);
    }
}