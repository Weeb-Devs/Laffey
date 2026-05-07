import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class clear extends Command {
    constructor() {
        super('clear', 'Clear the music queue');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true,
            requireQueue: true
        });
        if (guard.response) return guard.response;

        guard.player!.queue.clear();

        return CommandResponse.successText('Cleared the queue');
    }
}