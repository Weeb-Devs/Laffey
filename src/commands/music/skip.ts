import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class skip extends Command {
    constructor() {
        super('skip', 'Skip the current track');
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
        player.skip();
        return CommandResponse.successText(`Skipped ${player.queue.current?.title}`);
    }
}