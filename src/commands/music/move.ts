import {Command} from "../Command.js";
import {SlashCommandIntegerOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class move extends Command {
    constructor() {
        super('move', 'Move a song to a specific position in the queue', [
            new SlashCommandIntegerOption()
                .setName("old-pos")
                .setDescription('The track position on queue that you want to move'),
            new SlashCommandIntegerOption()
                .setName("new-pos")
                .setDescription('The position you want to move the track to'),
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
        const oldPos = ctx.getInteger("old-pos", 0);
        const newPos = ctx.getInteger("new-pos", 1);

        if (!oldPos || oldPos < 1 || oldPos > player.queue.length) return CommandResponse.error("Invalid old position");

        const target = player.queue[oldPos - 1];
        if (!target) return CommandResponse.error("Invalid old position");

        if (!newPos) {
            if (oldPos === 1) return CommandResponse.error("The song is already at the top of the queue");
            player.queue.splice(oldPos - 1, 1);
            player.queue.unshift(target);
            return CommandResponse.successText(`Moved **${target.title}** to the top of the queue`);
        }

        if (newPos < 1 || newPos > player.queue.length) return CommandResponse.error("Invalid new position");

        if (oldPos === newPos) return CommandResponse.error("The song is already in that position");
        player.queue.splice(oldPos - 1, 1);
        player.queue.splice(newPos - 1, 0, target);
        return CommandResponse.successText(`Moved **${target.title}** to position ${newPos}`);
    }
}