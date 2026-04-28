import {Command} from "../Command.js";
import {SlashCommandIntegerOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

export default class remove extends Command {
    constructor() {
        super('remove', 'Remove a song from the queue', [
            new SlashCommandIntegerOption()
                .setName("position")
                .setDescription("The track's position based on queue")
                .setRequired(true)
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!channel) return CommandResponse.error('You\'re not in a voice channel');
        if (player && (channel.id !== player.voiceId)) return CommandResponse.error('You\'re not in the same voice channel as the bot');
        if (!player.queue.length) return CommandResponse.error('There\'s no music in the queue');

        const position = ctx.getInteger("position", 0);
        if (!position || position < 1 || position > player.queue.length) return CommandResponse.error('Invalid position');

        const target = player.queue[position - 1]!;
        player.queue.remove(position - 1);

        return CommandResponse.successText(`Removed ${target.title} from the queue`);
    }
}