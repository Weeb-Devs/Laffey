import {Command} from "../Command.js";
import {SlashCommandIntegerOption, SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

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
        const player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!channel) return CommandResponse.error('You\'re not in a voice channel');
        if (player && (channel.id !== player.voiceId)) return CommandResponse.error('You\'re not in the same voice channel as the bot');

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