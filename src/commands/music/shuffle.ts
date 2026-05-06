import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class shuffle extends Command {
    constructor() {
        super('shuffle', 'Shuffle the music queue');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true,
            requireQueue: true
        });
        if (guard.response) return guard.response;

        guard.player!.queue.shuffle();

        return CommandResponse.successText('Shuffled the queue');
    }
}