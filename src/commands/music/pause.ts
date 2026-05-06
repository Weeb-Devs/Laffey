import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class pause extends Command {
    constructor() {
        super('pause', 'Pause the player');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        if (player.paused) return CommandResponse.error('Player is already paused');
        player.pause(true);

        return CommandResponse.successText(`Successfully paused the player`);
    }
}