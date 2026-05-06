import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class _24h extends Command {
    constructor() {
        super('24h', 'Enable 24h mode');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        const current = player.data.get("24h") || false;
        player.data.set("24h", !current);
        if (current && !player.queue.current && !player.queue.length && player.data.get("empty.time")) {
            const time = player.data.get("empty.time");
            const diff = Date.now() - time;
            if (diff > 2 * 60 * 1000) {
                await player.destroy();
                return CommandResponse.successText('24h mode disabled and player destroyed due to inactivity for 2 minutes');
            }

            const timeout = setTimeout(() => player.destroy().catch(() => void 0), (2 * 60 * 1000) - diff);
            player.data.set('empty.timeout', timeout);
            return CommandResponse.successText(`24h mode disabled and player will be destroyed in ${Math.ceil(((2 * 60 * 1000) - diff) / 1000)} seconds if player keeps inactive`);
        }
        return CommandResponse.successText(`24h mode ${!current ? 'enabled' : 'disabled'}`);
    }
}