import {Command} from "../Command.js";
import {SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import {LyricsService} from "../../service/lyricsService.js";

export default class lyrics extends Command {
    constructor() {
        super('lyrics', 'Get the lyrics of the current song', [
            new SlashCommandStringOption()
                .setName('song')
                .setDescription('The name of the song to search for (optional)')
                .setRequired(false)
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        await ctx.deferReply();
        const songQuery = ctx.getString("song", -1);
        let query, search = false;
        if (!songQuery) {
            const guard = this.guardMusic(ctx, {
                requirePlayer: true,
                requireCurrentTrack: true
            });
            if (guard.response) return guard.response;

            query = guard.player!.queue.current!.title + (guard.player!.queue.current!.author ? ` - ${guard.player!.queue.current!.author}` : '');
        } else {
            query = songQuery;
            search = true;
        }

        const songs = await LyricsService.getInstance().search(query);
        if (!songs.length) return CommandResponse.error('No lyrics found');
        if (!search) {
            const lyrics = await LyricsService.getInstance().getLyrics(songs[0]!);
            if (!lyrics) return CommandResponse.error('No lyrics found');
            const embeds = await LyricsService.getEmbed(songs[0]!, lyrics);
            return CommandResponse.successPaginated(embeds);
        }
        return CommandResponse.lyrics(songs);
    }
}