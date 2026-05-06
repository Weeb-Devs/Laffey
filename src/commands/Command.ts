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
        const voiceChannel = ctx.member && "voice" in ctx.member ? ctx.member.voice.channel || undefined : undefined;

        if ((options.requirePlayer || options.requireQueue || options.requireCurrentTrack || options.requireSameVoiceChannel) && !player) {
            return {
                player: undefined,
                voiceChannel: undefined,
                response: CommandResponse.error('There\'s no active player')
            };
        }

        if (options.requireVoiceChannel && !voiceChannel) {
            return {player, voiceChannel: undefined, response: CommandResponse.error('You\'re not in a voice channel')};
        }

        if (options.requireSameVoiceChannel) {
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
        }

        if (options.requireQueue && !player?.queue.length) {
            return {player, voiceChannel, response: CommandResponse.error('There\'s no music in the queue')};
        }

        if (options.requireCurrentTrack && !player?.queue.current) {
            return {player, voiceChannel, response: CommandResponse.error('There\'s no music playing')};
        }

        return {player, voiceChannel};
    }
}