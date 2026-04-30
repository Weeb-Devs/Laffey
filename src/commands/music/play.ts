import {Command} from "../Command.js";
import {SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

export default class play extends Command {
    constructor() {
        super('play', 'play music', [
            new SlashCommandStringOption()
                .setName('query')
                .setDescription('the query to search for')
        ])
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        let player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;

        let query = ctx.getString("query", 0);
        if (!query) {
            if (player?.paused) {
                player.pause(false);
                return CommandResponse.successText('Resumed the playback');
            } else return CommandResponse.error('Query must be provided');
        }
        await ctx.deferReply();

        console.log([ctx.guildId, channel?.id, ctx.channelId])
        if (!player) player = await ctx.client.player.createPlayer({
            guildId: ctx.guildId!,
            voiceId: channel!.id,
            textId: ctx.channelId!,
            deaf: true
        }).catch((e) => {
            console.error(e);
            return undefined;
        });
        if (!player) return CommandResponse.error('Failed to create player');

        const result = await player.search(query, {requester: ctx.member});
        if (!result.tracks || !result.tracks.length || !result.type) {
            if (!player.queue.current && !player.queue.length) await player.destroy();
            return CommandResponse.error('No results found');
        }

        const queue = (player.queue.current ? [player.queue.current] : []).concat([...player.queue]).filter(x => !!x);

        switch (result.type) {
            case "PLAYLIST": {
                let tracks = result.tracks.filter(t => !queue.some(a => a.identifier === t.identifier));
                if (!tracks.length) return CommandResponse.error('All songs in the playlist are already queued');

                player.queue.add(tracks);
                if (!player.playing && !player.paused) await player.play();
                return CommandResponse.successText(`Queued ${tracks.length} songs from \`${result.playlistName}\``);
            }

            case "TRACK":
            case "SEARCH": {
                if (!result.tracks.length) return CommandResponse.error('No results found');
                if (queue.some(a => a?.identifier === result.tracks[0]!.identifier)) return CommandResponse.error('The song is already queued');


                player.queue.add(result.tracks[0]!);
                if (!player.playing && !player.paused) await player.play();
                return CommandResponse.successText(`Queued ${result.tracks[0]!.title}`);
            }

            default: {
                return CommandResponse.error(`Unknown response type received: ${result.type}`);
            }
        }
    }
}