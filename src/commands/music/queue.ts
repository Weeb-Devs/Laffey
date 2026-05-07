import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse, CommandResponseType} from "../commandResponse.js";
import {Utils} from "../../utils/utils.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";

export default class queue extends Command {
    constructor() {
        super('queue', 'Show the music queue');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireCurrentTrack: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        if (!player.queue.current) return CommandResponse.error('There\'s no music playing');

        return CommandResponse.successPaginated(this.buildQueueEmbeds(player, player.queue.current as any), CommandResponseType.paginated);
    }

    private buildQueueEmbeds(player: any, track: any) {
        const pageSize = 10;

        const trim = (value: string | undefined | null, max: number) => {
            if (!value) return 'Unknown';
            return value.length > max ? `${value.slice(0, max - 3)}...` : value;
        };

        const formatDuration = (ms?: number | null, isStream?: boolean) => {
            if (isStream) return '◉ LIVE';
            if (!ms || isNaN(ms)) return 'Unknown';
            return new Date(ms).toISOString().slice(11, 19);
        };

        const formatRequester = (track: any) => {
            const requester = track?.requester;
            if (!requester) return 'Unknown';
            if (typeof requester === 'string') return requester;
            if (typeof requester === 'object') {
                if ('id' in requester) return `<@${requester.id}>`;
                if ('username' in requester) return requester.username;
            }
            return 'Unknown';
        };

        const nowPlayingBlock = [
            `**${trim(track.title, 60)}**`,
            track.author ? `Author: ${trim(track.author, 50)}` : null,
            `Duration: ${formatDuration(track.length, track.isStream)}`,
            `Requester: ${formatRequester(track)}`,
        ].filter(Boolean).join('\n');

        const formatTrackLine = (track: any, index: number) => {
            const title = trim(track?.title, 45);
            const duration = formatDuration(track?.length, track?.isStream);
            const requester = formatRequester(track);
            return `\`${index}.\` **${title}** \`[${duration}]\` - ${requester}`;
        };

        const queueTracks = player.queue.filter((track: any) => !!track);
        let index = 0;

        let embeds = Utils.chunkArray(queueTracks, pageSize).map((chunk, pageIndex, allPages) => {
            const queueLines = chunk.length
                ? chunk.map((track: any) => formatTrackLine(track, ++index)).join('\n')
                : 'Add more song by using play command :D';

            return new EmbedBuilder()
                .setTitle('Queue')
                .setURL(track.uri || null)
                .setThumbnail(track.thumbnail || null)
                .addFields([
                    {name: "Now Playing:", value: nowPlayingBlock},
                    {name: "Up Next:", value: queueLines}
                ])
                .setFooter({text: `Page ${pageIndex + 1}/${Math.max(allPages.length, 1)} | ${queueTracks.length} track(s) in queue`});
        });

        if (!embeds.length) {
            embeds = [new EmbedBuilder()
                .setTitle('Queue')
                .setURL(track.uri || null)
                .setThumbnail(track.thumbnail || null)
                .setDescription(`Now playing:\n${nowPlayingBlock}\n\nUp next:\nAdd more song by using play command :D`)
                .setFooter({text: `Page 1/1 | ${queueTracks.length} track(s) in queue`})
            ];
        }

        return embeds;
    }
}