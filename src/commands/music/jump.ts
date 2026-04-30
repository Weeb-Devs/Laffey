import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

export default class jump extends Command {
    constructor() {
        super('jump', 'Jump to a specific song in the queue');
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

        const current = player.queue.current;
        const target = player.queue.splice(position - 1, 1)[0]!;
        await player.play(target);

        if (player.loop === "queue") {
            if (current) player.queue.add(current);
            for (let i = 0; i < position; i++) player.queue.add(player.queue.shift()!);
        } else for (let i = 0; i < position; i++) player.queue.shift();

        return CommandResponse.successText(`Jumped to **${target.title}**`);
    }
}