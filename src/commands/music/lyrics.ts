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
        const songQuery = ctx.getString("song", -1);
        let query, search = false;
        if (!songQuery) {
            let player = ctx.client.player.players.get(ctx.guildId!);
            if (!player) return CommandResponse.error('There\'s no active player');
            if (!player.queue.current) return CommandResponse.error(`There\'s no music playing`);
            query = player.queue.current.title + player.queue.current.author ? ` - ${player.queue.current.author}` : '';
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