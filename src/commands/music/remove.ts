import {Command} from "../Command.js";
import {SlashCommandIntegerOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class remove extends Command {
    constructor() {
        super('remove', 'Remove a song from the queue', [
            new SlashCommandIntegerOption()
                .setName("position")
                .setDescription("The track's position based on queue")
                .setRequired(true)
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true,
            requireQueue: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        const position = ctx.getInteger("position", 0);
        if (!position || position < 1 || position > player.queue.length) return CommandResponse.error('Invalid position');

        const target = player.queue[position - 1]!;
        player.queue.remove(position - 1);

        return CommandResponse.successText(`Removed ${target.title} from the queue`);
    }
}