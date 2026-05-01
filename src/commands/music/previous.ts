import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {GuildMember} from "discord.js";

export default class previous extends Command {
    constructor() {
        super('previous', 'Play the previous song in the queue');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!channel) return CommandResponse.error('You\'re not in a voice channel');
        if (player && (channel.id !== player.voiceId)) return CommandResponse.error('You\'re not in the same voice channel as the bot');

        const prev = player.getPrevious(true);
        if (!prev) return CommandResponse.error('There\'s no previous song');

        await player.play(prev);

        return CommandResponse.successText(`Playing **${prev.title}**`);
    }
}