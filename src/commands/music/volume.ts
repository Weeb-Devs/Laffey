import {Command} from "../Command.js";
import {SlashCommandIntegerOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class volume extends Command {
    constructor() {
        super('volume', 'Change the volume of the player', [
            new SlashCommandIntegerOption()
                .setName('volume')
                .setDescription('Volume with range of 0-100')
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true
        });
        if (guard.response) return guard.response;

        const volume = ctx.getInteger('volume', 0) || 100;
        await guard.player!.setVolume(volume);
        return CommandResponse.successText(`Set the volume to ${volume}`);
    }
}