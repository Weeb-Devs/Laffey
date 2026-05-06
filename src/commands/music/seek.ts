import {Command} from "../Command.js";
import {SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";

export default class seek extends Command {
    constructor() {
        super('seek', 'Seek to a specific position in the currently playing track.', [
            new SlashCommandStringOption()
                .setName("position")
                .setDescription("The position to seek. Format: mm:ss or ss")
                .setRequired(true)
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true,
            requireCurrentTrack: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        const position = ctx.getString("position", -1);
        if (!position) return CommandResponse.error("Invalid position");

        const regex = /^(\d{1,2}):([0-5]?\d)$|^(\d+)$/;
        const match = position.match(regex);
        if (!match) return CommandResponse.error("Invalid position format");

        const minutes = match[1];
        const seconds = match[2] ?? match[3];

        const time = minutes ? Number(minutes) * 60 + Number(seconds) : Number(seconds);

        await player.seek(time * 1000);
        return CommandResponse.successText(`Seeked to ${time}s`);
    }
}