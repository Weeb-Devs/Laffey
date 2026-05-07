import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class stop extends Command {
    constructor() {
        super('stop', 'Stop the player');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        player.queue.clear();
        await player.shoukaku.stopTrack();

        return CommandResponse.successText('Stopped the player');
    }
}