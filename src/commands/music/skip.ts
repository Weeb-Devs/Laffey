import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

export default class skip extends Command {
    constructor() {
        super('skip', 'Skip the current track');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!channel) return CommandResponse.error('You\'re not in a voice channel');
        if (player && (channel.id !== player.voiceId)) return CommandResponse.error('You\'re not in the same voice channel as the bot');
        if (!player.queue.length) return CommandResponse.error('There\'s no music in the queue');

        player.skip();
        return CommandResponse.successText(`Skipped ${player.queue.current?.title}`);
    }
}