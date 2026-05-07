import {
    type ApplicationCommandData,
    type ApplicationCommandOptionData,
    InteractionContextType,
    type VoiceBasedChannel
} from "discord.js";
import type {KazagumoPlayer} from "kazagumo";
import type {InteractionAdapter} from "../adapter/InteractionAdapter.js";
import {CommandResponse} from "./commandResponse.js";

export interface MusicCommandGuardOptions {
    requirePlayer?: boolean;
    requireVoiceChannel?: boolean;
    requireSameVoiceChannel?: boolean;
    requireQueue?: boolean;
    requireCurrentTrack?: boolean;
}

export interface MusicCommandGuardResult {
    player: KazagumoPlayer | undefined;
    voiceChannel: VoiceBasedChannel | undefined;
    response?: CommandResponse;
}

export abstract class Command {
    protected constructor(private name: string,
                          private description: string,
                          private options: ApplicationCommandOptionData[] = [],
                          private data?: {
                              contexts?: InteractionContextType[]
                          }) {
    }

    abstract execute(ctx: InteractionAdapter): Promise<CommandResponse>;

    build(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            contexts: this.data?.contexts || [InteractionContextType.Guild]
        };
    }

    protected guardMusic(ctx: InteractionAdapter, options: MusicCommandGuardOptions = {}): MusicCommandGuardResult {
        const player = ctx.guildId ? ctx.client.player.players.get(ctx.guildId) : undefined;
        const voiceChannel = this.getVoiceChannel(ctx);

        const playerCheck = this.checkPlayerRequired(player, options);
        if (playerCheck) return playerCheck;

        const voiceCheck = this.checkVoiceChannelRequired(voiceChannel, options, player);
        if (voiceCheck) return voiceCheck;

        const sameVCCheck = this.checkSameVoiceChannel(voiceChannel, player, options);
        if (sameVCCheck) return sameVCCheck;

        const queueCheck = this.checkQueueRequired(player, options);
        if (queueCheck) return queueCheck;

        const trackCheck = this.checkCurrentTrackRequired(player, options);
        if (trackCheck) return trackCheck;

        return {player, voiceChannel};
    }

    private getVoiceChannel(ctx: InteractionAdapter): VoiceBasedChannel | undefined {
        return ctx.member && "voice" in ctx.member ? ctx.member.voice.channel || undefined : undefined;
    }

    private checkPlayerRequired(player: KazagumoPlayer | undefined, options: MusicCommandGuardOptions): MusicCommandGuardResult | undefined {
        if ((options.requirePlayer || options.requireQueue || options.requireCurrentTrack || options.requireSameVoiceChannel) && !player) {
            return {
                player: undefined,
                voiceChannel: undefined,
                response: CommandResponse.error('There\'s no active player')
            };
        }
        return undefined;
    }

    private checkVoiceChannelRequired(voiceChannel: VoiceBasedChannel | undefined, options: MusicCommandGuardOptions, player: KazagumoPlayer | undefined): MusicCommandGuardResult | undefined {
        if (options.requireVoiceChannel && !voiceChannel) {
            return {player, voiceChannel: undefined, response: CommandResponse.error('You\'re not in a voice channel')};
        }
        return undefined;
    }

    private checkSameVoiceChannel(voiceChannel: VoiceBasedChannel | undefined, player: KazagumoPlayer | undefined, options: MusicCommandGuardOptions): MusicCommandGuardResult | undefined {
        if (!options.requireSameVoiceChannel) return undefined;

        if (!voiceChannel) {
            return {
                player,
                voiceChannel: undefined,
                response: CommandResponse.error('You\'re not in a voice channel')
            };
        }

        if (player && voiceChannel.id !== player.voiceId) {
            return {
                player,
                voiceChannel,
                response: CommandResponse.error('You\'re not in the same voice channel as the bot')
            };
        }

        return undefined;
    }

    private checkQueueRequired(player: KazagumoPlayer | undefined, options: MusicCommandGuardOptions): MusicCommandGuardResult | undefined {
        if (options.requireQueue && !player?.queue.length) {
            return {player, voiceChannel: undefined, response: CommandResponse.error('There\'s no music in the queue')};
        }
        return undefined;
    }

    private checkCurrentTrackRequired(player: KazagumoPlayer | undefined, options: MusicCommandGuardOptions): MusicCommandGuardResult | undefined {
        if (options.requireCurrentTrack && !player?.queue.current) {
            return {player, voiceChannel: undefined, response: CommandResponse.error('There\'s no music playing')};
        }
        return undefined;
    }

}