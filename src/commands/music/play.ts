import {Command} from "../Command.js";
import {SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import {Logger} from "../../utils/logger.js";
import type {KazagumoPlayer} from "kazagumo";

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

        const guard = this.guardMusic(ctx, {
            requireVoiceChannel: true,
            requireSameVoiceChannel: !!player
        });
        if (guard.response) return guard.response;

        const query = ctx.getString("query", -1);
        const resumeResult = this.handleResumeCase(player, query);
        if (resumeResult) return resumeResult;

        const channel = guard.voiceChannel;
        await ctx.deferReply();

        player = await this.ensurePlayer(ctx, player, channel!);
        if (!player) return CommandResponse.error('Failed to create player');

        return this.handleSearch(player, query, ctx);
    }

    private handleResumeCase(player: KazagumoPlayer | undefined, query: string | undefined): CommandResponse | undefined {
        if (!query) {
            if (player?.paused) {
                player.pause(false);
                return CommandResponse.successText('Resumed the playback');
            } else return CommandResponse.error('Query must be provided');
        }
        return undefined;
    }

    private async ensurePlayer(
        ctx: InteractionAdapter,
        existingPlayer: KazagumoPlayer | undefined,
        voiceChannel: any
    ): Promise<KazagumoPlayer | undefined> {
        if (existingPlayer) return existingPlayer;

        return ctx.client.player.createPlayer({
            guildId: ctx.guildId!,
            voiceId: voiceChannel.id,
            textId: ctx.channelId!,
            deaf: true
        }).catch((e) => {
            Logger.errorStack(`Something wrong when creating player on ${ctx.guildId}`, 'Command', e);
            return undefined;
        });
    }

    private async handleSearch(player: KazagumoPlayer, query: string | undefined, ctx: InteractionAdapter): Promise<CommandResponse> {
        if (!query) return CommandResponse.error('Query must be provided');

        const result = await player.search(query, {requester: ctx.user});
        if (!result.tracks || !result.tracks.length || !result.type) {
            if (!player.queue.current && !player.queue.length) await player.destroy();
            return CommandResponse.error('No results found');
        }

        const queue = (player.queue.current ? [player.queue.current] : []).concat([...player.queue]).filter(x => !!x);

        return this.handleSearchResult(player, result, queue);
    }

    private async handleSearchResult(player: KazagumoPlayer, result: any, queue: any[]): Promise<CommandResponse> {
        switch (result.type) {
            case "PLAYLIST":
                return this.handlePlaylistResult(player, result, queue);

            case "TRACK":
            case "SEARCH":
                return this.handleTrackResult(player, result, queue);

            default:
                return CommandResponse.error(`Unknown response type received: ${result.type}`);
        }
    }

    private async handlePlaylistResult(player: KazagumoPlayer, result: any, queue: any[]): Promise<CommandResponse> {
        let tracks = result.tracks.filter((t: any) => !queue.some(a => a.identifier === t.identifier));
        if (!tracks.length) return CommandResponse.error('All songs in the playlist are already queued');

        player.queue.add(tracks);
        if (!player.playing && !player.paused) await player.play();
        return CommandResponse.successText(`Queued ${tracks.length} songs from \`${result.playlistName}\``);
    }

    private async handleTrackResult(player: KazagumoPlayer, result: any, queue: any[]): Promise<CommandResponse> {
        if (!result.tracks.length) return CommandResponse.error('No results found');
        if (queue.some(a => a?.identifier === result.tracks[0]!.identifier)) return CommandResponse.error('The song is already queued');

        player.queue.add(result.tracks[0]!);
        if (!player.playing && !player.paused) await player.play();
        return CommandResponse.successText(`Queued ${result.tracks[0]!.title}`);
    }
}