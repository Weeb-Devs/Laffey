import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class loop extends Command {
    constructor() {
        super('loop', 'Toggle the loop mode');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true
        });
        if (guard.response) return guard.response;

        const status = guard.player!.setLoop();

        return CommandResponse.successText(`Loop mode is now ${status.loop}`);
    }
}