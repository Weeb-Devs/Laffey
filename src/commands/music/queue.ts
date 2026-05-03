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


        let j = 0;

        let embeds = Utils.chunkArray(player.queue, 10).map((d) => new EmbedBuilder()
            .setDescription(player.queue.length && d.filter(x => !!x).length ?
                (() => {
                    const info = d.filter(x => !!x).map((track) => {
                        let trackTitle = track?.title.length >= 45 ? `${track?.title.slice(0, 45)}...` : track?.title
                        return `${++j} - ${trackTitle}${' '.repeat((48 - (trackTitle.length)))} ${track.isStream ? '◉ LIVE' : ((track.length || !isNaN(track.length!)) ? new Date(track.length!).toISOString().slice(11, 19) : 'Unknown')}`
                    }).join("\n");

                    return `Current song: ${player.queue.current!.title}\n\n` +
                        `${info ? info : 'Not detected'}\n`

                })()
                : `Current song: ${player.queue.current!.title}\n\n` +
                `Add more song by using play command :D\n`)
        )
        if (!embeds.length) embeds = [new EmbedBuilder().setTitle("Queue").setDescription(`Current song: ${player.queue.current.title}\n\n Add more song by using play command :D\n`)]

        return CommandResponse.successPaginated(embeds, CommandResponseType.paginated);
    }
}