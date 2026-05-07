import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class jump extends Command {
    constructor() {
        super('jump', 'Jump to a specific song in the queue');
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

        const current = player.queue.current;
        const target = player.queue.splice(position - 1, 1)[0]!;
        await player.play(target);

        if (player.loop === "queue") {
            if (current) player.queue.add(current);
            for (let i = 0; i < position; i++) player.queue.add(player.queue.shift()!);
        } else for (let i = 0; i < position; i++) player.queue.shift();

        return CommandResponse.successText(`Jumped to **${target.title}**`);
    }
}