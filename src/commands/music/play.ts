import {Command} from "../Command.js";
import {SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import type {CommandResponse} from "../commandResponse.js";
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
        if (!query) return this.getResponse('Query must be provided', true);
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
        if (!player) return this.getResponse('Failed to create player', true);

        const result = await player.search(query, {requester: ctx.member});
        if (!result.tracks || !result.tracks.length || !result.type) {
            if (!player.queue.current && !player.queue.length) player.destroy();
            return this.getResponse('No results found', true);
        }

        const queue = (player.queue.current ? [player.queue.current] : []).concat([...player.queue]).filter(x => !!x);

        switch (result.type) {
            case "PLAYLIST": {
                let tracks = result.tracks.filter(t => !queue.some(a => a.identifier === t.identifier));
                if (!tracks.length) return this.getResponse('All songs in the playlist are already queued', true);

                player.queue.add(tracks);
                if (!player.playing && !player.paused) await player.play();
                return this.getResponse(`Queued ${tracks.length} songs from \`${result.playlistName}\``);
            }

            case "TRACK":
            case "SEARCH": {
                if (!result.tracks.length) return this.getResponse('No results found', true);
                if (queue.some(a => a?.identifier === result.tracks[0]!.identifier)) return this.getResponse('The song is already queued', true);


                player.queue.add(result.tracks[0]!);
                if (!player.playing && !player.paused) await player.play();
                return this.getResponse(`Queued ${result.tracks[0]!.title}`);
            }

            default: {
                return this.getResponse(`Unknown response type received: ${result.type}`);
            }
        }
    }
}