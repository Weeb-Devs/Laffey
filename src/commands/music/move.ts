import {Command} from "../Command.js";
import {SlashCommandIntegerOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

export default class move extends Command {
    constructor() {
        super('move', 'Move a song to a specific position in the queue', [
            new SlashCommandIntegerOption()
                .setName("old-pos")
                .setDescription('The track position on queue that you want to move'),
            new SlashCommandIntegerOption()
                .setName("new-pos")
                .setDescription('The position you want to move the track to'),
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!channel) return CommandResponse.error('You\'re not in a voice channel');
        if (player && (channel.id !== player.voiceId)) return CommandResponse.error('You\'re not in the same voice channel as the bot');
        if (!player.queue.length) return CommandResponse.error('There\'s no music in the queue');

        const oldPos = ctx.getInteger("old-pos", 0);
        const newPos = ctx.getInteger("new-pos", 1);

        if (!oldPos || oldPos < 1 || oldPos > player.queue.length) return CommandResponse.error("Invalid old position");

        const target = player.queue[oldPos - 1];
        if (!target) return CommandResponse.error("Invalid old position");

        if (!newPos) {
            if (oldPos === 1) return CommandResponse.error("The song is already at the top of the queue");
            player.queue.splice(oldPos - 1, 1);
            player.queue.unshift(target);
            return CommandResponse.successText(`Moved **${target.title}** to the top of the queue`);
        }

        if (newPos < 1 || newPos > player.queue.length) return CommandResponse.error("Invalid new position");

        if (oldPos === newPos) return CommandResponse.error("The song is already in that position");
        player.queue.splice(oldPos - 1, 1);
        player.queue.splice(newPos - 1, 0, target);
        return CommandResponse.successText(`Moved **${target.title}** to position ${newPos}`);
    }
}