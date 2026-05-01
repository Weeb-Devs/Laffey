import {Command} from "../Command.js";
import {SlashCommandBooleanOption, SlashCommandNumberOption, SlashCommandSubcommandBuilder} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import {EmbedBuilder, type GuildMember} from "discord.js";
import type {KazagumoPlayer} from "kazagumo";

export default class effect extends Command {
    private static valueOption = (option: SlashCommandNumberOption) =>
        option.setName("value")
            .setDescription("The value to set")
            .setMinValue(0)
            .setMaxValue(100)
            .setRequired(true);
    private static stateOption = (option: SlashCommandBooleanOption) =>
        option.setName("state")
            .setDescription("The state to set");


    constructor() {
        super('effect', 'Manage effect of the current player', [
            new SlashCommandSubcommandBuilder()
                .setName("list")
                .setDescription("List all filters").toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("reset")
                .setDescription("Reset all filters").toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("bassboost")
                .setDescription("Set bass boost value")
                .addNumberOption(effect.valueOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("nightcore")
                .setDescription("Toggle nightcore")
                .addBooleanOption(effect.stateOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("distort")
                .setDescription("Toggle distort")
                .addBooleanOption(effect.stateOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("karaoke")
                .setDescription("Toggle karaoke")
                .addBooleanOption(effect.stateOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("8d")
                .setDescription("Toggle 8d mode")
                .addBooleanOption(effect.stateOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("vaporwave")
                .setDescription("Toggle vaporwave")
                .addBooleanOption(effect.stateOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("speed")
                .setDescription("Set speed value")
                .addNumberOption(effect.valueOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("pitch")
                .setDescription("Set pitch value")
                .addNumberOption(effect.valueOption).toJSON(),
            new SlashCommandSubcommandBuilder()
                .setName("rate")
                .setDescription("Set rate value")
                .addNumberOption(effect.valueOption).toJSON()
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const player = ctx.client.player.players.get(ctx.guildId!);
        const {channel} = (ctx.member as GuildMember)!.voice;
        if (!player) return CommandResponse.error('There\'s no active player');
        if (!channel) return CommandResponse.error('You\'re not in a voice channel');
        if (player && (channel.id !== player.voiceId)) return CommandResponse.error('You\'re not in the same voice channel as the bot');

        const subCommand = ctx.getSubCommand()
        if (!subCommand) return CommandResponse.error('Invalid subcommand');

        const value = ctx.getInteger("value", 1);
        const state = ctx.getBoolean("state", 1);

        const currentFilterState = this.checkFilterState(player, subCommand);
        const targetState = state === undefined ? !currentFilterState : state;

        switch (subCommand) {
            case "reset": {
                if (["bassboost", "nightcore", "8d", "vaporwave", "distort", "karaoke"].every(f => !this.checkFilterState(player, f)) && !player.shoukaku.filters.timescale)
                    return CommandResponse.error('All filters are already reset');
                await player.shoukaku.clearFilters();
                return CommandResponse.successText('Reset all filters');
            }

            case "bassboost": {
                if (value && (value < 0 || value > 100)) return CommandResponse.error('Invalid value for bass boost. Must be between 0-100');
                const max = 5;
                const gain = (value || 0) / 100 * max;
                if (gain === player.shoukaku.filters.equalizer?.[0]?.gain) return CommandResponse.error(`Bass boost is already set to ${value}%`);

                player.shoukaku.filters.equalizer = new Array(2).fill(null).map((_, i) => ({band: i, gain}));
                await this.applyFilters(player);
                return CommandResponse.successText(gain ? `Set bass boost to ${value}%` : 'Disabled bass boost');
            }

            case "nightcore": {
                if (targetState === currentFilterState) return CommandResponse.error(`Nightcore is already ${targetState ? 'enabled' : 'disabled'}`);
                player.shoukaku.filters.timescale = targetState ? this.nightCoreTimescale : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`Nightcore is now ${targetState ? 'enabled' : 'disabled'}`);
            }

            case "8d": {
                if (targetState === currentFilterState) return CommandResponse.error(`8d mode is already ${targetState ? 'enabled' : 'disabled'}`);
                player.shoukaku.filters.rotation = targetState ? this.eightDimensionalRotation : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`8d mode is now ${targetState ? 'enabled' : 'disabled'}`);
            }

            case "vaporwave": {
                if (targetState === currentFilterState) return CommandResponse.error(`vaporwave mode is already ${targetState ? 'enabled' : 'disabled'}`);
                player.shoukaku.filters.timescale = targetState ? this.vaporWaveTimescale : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`Vaporwave is now ${targetState ? 'enabled' : 'disabled'}`);
            }

            case "distort": {
                if (targetState === currentFilterState) return CommandResponse.error(`distort mode is already ${targetState ? 'enabled' : 'disabled'}`);
                player.shoukaku.filters.distortion = targetState ? this.distortion : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`Distortion is now ${targetState ? 'enabled' : 'disabled'}`);
            }

            case "karaoke": {
                if (targetState === currentFilterState) return CommandResponse.error(`karaoke mode is already ${targetState ? 'enabled' : 'disabled'}`);
                player.shoukaku.filters.karaoke = targetState ? this.karaoke : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`Karaoke is now ${targetState ? 'enabled' : 'disabled'}`);
            }

            case "speed": {
                if (value && (value < 0.5 || value > 2)) return CommandResponse.error('Invalid value for speed. Must be between 0.5-2');
                if (value && value === player.shoukaku.filters.timescale?.speed) return CommandResponse.error(`Speed is already set to ${value}x`);

                player.shoukaku.filters.timescale = player.shoukaku.filters.timescale ?
                    {...player.shoukaku.filters.timescale, speed: value || 1} : value ? {speed: value} : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`Set speed to ${value}x`);
            }

            case "pitch": {
                if (value && (value < 0.5 || value > 3)) return CommandResponse.error('Invalid value for pitch. Must be between 0.5-3');
                if (value && value === player.shoukaku.filters.timescale?.pitch) return CommandResponse.error(`Pitch is already set to ${value}x`);

                player.shoukaku.filters.timescale = player.shoukaku.filters.timescale ?
                    {...player.shoukaku.filters.timescale, pitch: value || 1} : value ? {pitch: value} : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`Set pitch to ${value}x`);
            }

            case "rate": {
                if (value && (value < 0.5 || value > 3)) return CommandResponse.error('Invalid value for rate. Must be between 0.5-3');
                if (value && value === player.shoukaku.filters.timescale?.rate) return CommandResponse.error(`Rate is already set to ${value}x`);

                player.shoukaku.filters.timescale = player.shoukaku.filters.timescale ?
                    {...player.shoukaku.filters.timescale, rate: value || 1} : value ? {rate: value} : null;
                await this.applyFilters(player);
                return CommandResponse.successText(`Set pitch to ${value}x`);
            }

            case "list": {
                const filters = player.filters;
                const embed = new EmbedBuilder()
                    .setDescription([
                        `**bassboost:** ${filters.equalizer?.some(e => e.gain > 0) ? 'enabled' : 'disabled'}`,
                        `**vaporwave:** ${filters.timescale?.speed === this.vaporWaveTimescale.speed && filters.timescale?.pitch === this.vaporWaveTimescale.pitch ? 'enabled' : 'disabled'}`,
                        `**nightcore:** ${filters.timescale?.speed === this.nightCoreTimescale.speed && filters.timescale?.pitch === this.nightCoreTimescale.pitch ? 'enabled' : 'disabled'}`,
                        `**8d:** ${filters.rotation?.rotationHz === this.eightDimensionalRotation.rotationHz ? 'enabled' : 'disabled'}`,
                        `**distortion:** ${filters.distortion ? 'enabled' : 'disabled'}`,
                        `**karaoke:** ${filters.karaoke ? 'enabled' : 'disabled'}`,
                        `**speed:** ${filters.timescale?.speed ?? 1}`,
                        `**pitch:** ${filters.timescale?.pitch ?? 1}`,
                        `**rate:** ${filters.timescale?.rate ?? 1}`,
                    ].join("\n"));
                return CommandResponse.success(embed);
            }

            default:
                return CommandResponse.error('Invalid subcommand');
        }
    }

    private async applyFilters(player: KazagumoPlayer) {
        return player.shoukaku.setFilters(player.filters);
    }

    private checkFilterState(player: KazagumoPlayer, filter: string) {
        const filters = player.filters;
        switch (filter) {
            case "bassboost":
                return filters.equalizer?.some(e => e.gain > 0) || false;
            case "vaporwave":
                return filters.timescale?.speed === this.vaporWaveTimescale.speed && filters.timescale?.pitch === this.vaporWaveTimescale.pitch;
            case "nightcore":
                return filters.timescale?.speed === this.nightCoreTimescale.speed && filters.timescale?.pitch === this.nightCoreTimescale.pitch;
            case "8d":
                return filters.rotation?.rotationHz === this.eightDimensionalRotation.rotationHz;
            case "distortion":
                return !!filters.distortion;
            case "karaoke":
                return !!filters.karaoke;
            default:
                return false;
        }
    }

    public get nightCoreTimescale() {
        return {
            speed: 1.2999999523162842,
            pitch: 1.2999999523162842,
            rate: 1
        }
    }

    public get eightDimensionalRotation() {
        return {
            rotationHz: 0.35
        }
    }

    public get vaporWaveTimescale() {
        return {
            speed: 0.8500000238418579,
            pitch: 0.800000011920929,
            rate: 1
        }
    }

    public get distortion() {
        return {
            sinOffset: 0,
            sinScale: 1,
            cosOffset: 0,
            cosScale: 1,
            tanOffset: 0,
            tanScale: 1,
            offset: 0,
            scale: 0.7
        }
    }

    public get karaoke() {
        return {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0
        }
    }
}