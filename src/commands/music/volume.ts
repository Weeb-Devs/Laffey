import {Command} from "../Command.js";
import {SlashCommandIntegerOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

export default class volume extends Command {
    constructor() {
        super('volume', 'Change the volume of the player', [
            new SlashCommandIntegerOption()
                .setName('volume')
                .setDescription('Volume with range of 0-100')
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!channel) return CommandResponse.error('You\'re not in a voice channel');
        if (player && (channel.id !== player.voiceId)) return CommandResponse.error('You\'re not in the same voice channel as the bot');

        player.setVolume(ctx.getInteger('volume', 0) || 100);
        return CommandResponse.successText(`Set the volume to ${ctx.getInteger('volume', 0) || 100}`);
    }
}