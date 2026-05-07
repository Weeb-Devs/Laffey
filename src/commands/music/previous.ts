import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class previous extends Command {
    constructor() {
        super('previous', 'Play the previous song in the queue');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        const prev = player.getPrevious(true);
        if (!prev) return CommandResponse.error('There\'s no previous song');

        await player.play(prev);

        return CommandResponse.successText(`Playing **${prev.title}**`);
    }
}