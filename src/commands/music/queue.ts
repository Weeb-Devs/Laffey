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
        const player = ctx.client.player.players.get(ctx.guildId!);
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!player.queue.current) return CommandResponse.error('There\'s no music playing');

        const current = player.queue.current;
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
            `**${trim(current.title, 60)}**`,
            current.author ? `Author: ${trim(current.author, 50)}` : null,
            `Duration: ${formatDuration(current.length, current.isStream)}`,
            `Requester: ${formatRequester(current)}`,
        ].filter(Boolean).join('\n');

        const formatTrackLine = (track: any, index: number) => {
            const title = trim(track?.title, 45);
            const duration = formatDuration(track?.length, track?.isStream);
            const requester = formatRequester(track);
            return `\`${index}.\` **${title}** \`[${duration}]\` - ${requester}`;
        };

        const queueTracks = player.queue.filter((track) => !!track);
        let index = 0;

        let embeds = Utils.chunkArray(queueTracks, pageSize).map((chunk, pageIndex, allPages) => {
            const queueLines = chunk.length
                ? chunk.map((track) => formatTrackLine(track, ++index)).join('\n')
                : 'Add more song by using play command :D';

            return new EmbedBuilder()
                .setTitle('Queue')
                .setURL(current.uri || null)
                .setThumbnail(current.thumbnail || null)
                .addFields([
                    {name: "Now Playing:", value: nowPlayingBlock},
                    {name: "Up Next:", value: queueLines}
                ])
                .setFooter({text: `Page ${pageIndex + 1}/${Math.max(allPages.length, 1)} | ${queueTracks.length} track(s) in queue`});
        });

        if (!embeds.length) {
            embeds = [new EmbedBuilder()
                .setTitle('Queue')
                .setURL(current.uri || null)
                .setThumbnail(current.thumbnail || null)
                .setDescription(`Now playing:\n${nowPlayingBlock}\n\nUp next:\nAdd more song by using play command :D`)
                .setFooter({text: `Page 1/1 | ${queueTracks.length} track(s) in queue`})
            ];
        }

        return CommandResponse.successPaginated(embeds, CommandResponseType.paginated);
    }
}