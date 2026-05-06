import {Command} from "../Command.js";
import {SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class search extends Command {
    constructor() {
        super('search', 'Search for a song', [
            new SlashCommandStringOption()
                .setName('query')
                .setDescription('The query to search')
                .setRequired(true)
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const player = ctx.client.player.players.get(ctx.guildId!);
        if (player) {
            const guard = this.guardMusic(ctx, {
                requirePlayer: true,
                requireVoiceChannel: true,
                requireSameVoiceChannel: true
            });
            if (guard.response) return guard.response;
        }
        await ctx.deferReply();

        const query = ctx.getString("query", -1);
        if (!query) return CommandResponse.error('Query must be provided');
        const result = await ctx.client.player.search(query, {requester: ctx.user});

        return CommandResponse.search({query, tracks: result.tracks});
    }
}
