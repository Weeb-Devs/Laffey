import {Command} from "../Command.js";
import {SlashCommandBooleanOption, SlashCommandNumberOption, SlashCommandSubcommandBuilder} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import type {KazagumoPlayer} from "kazagumo";
import {EmbedBuilder} from "../../builder/embedBuilder.js";

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
        const guard = this.guardMusic(ctx, {
            requirePlayer: true,
            requireVoiceChannel: true,
            requireSameVoiceChannel: true
        });
        if (guard.response) return guard.response;

        const player = guard.player!;
        const subCommand = ctx.getSubCommand();
        if (!subCommand) return CommandResponse.error('Invalid subcommand');

        const value = ctx.getInteger("value", 1);
        const state = ctx.getBoolean("state", 1);

        return this.handleSubCommand(player, subCommand, value, state);
    }

    private async handleSubCommand(
        player: KazagumoPlayer,
        subCommand: string,
        value: number | undefined,
        state: boolean | undefined
    ): Promise<CommandResponse> {
        const currentFilterState = this.checkFilterState(player, subCommand);
        const targetState = state === undefined ? !currentFilterState : state;

        switch (subCommand) {
            case "reset":
                return this.handleReset(player);
            case "bassboost":
                return this.handleBassboost(player, value);
            case "nightcore":
                return this.handleNightcore(player, currentFilterState, targetState);
            case "8d":
                return this.handleEightDimensional(player, currentFilterState, targetState);
            case "vaporwave":
                return this.handleVaporwave(player, currentFilterState, targetState);
            case "distort":
                return this.handleDistort(player, currentFilterState, targetState);
            case "karaoke":
                return this.handleKaraoke(player, currentFilterState, targetState);
            case "speed":
                return this.handleTimescaleValue(player, "speed", value, 0.5, 2, "Speed", "speed");
            case "pitch":
                return this.handleTimescaleValue(player, "pitch", value, 0.5, 3, "Pitch", "pitch");
            case "rate":
                return this.handleTimescaleValue(player, "rate", value, 0.5, 3, "Rate", "pitch");
            case "list":
                return this.handleList(player);
            default:
                return CommandResponse.error('Invalid subcommand');
        }
    }

    private async handleReset(player: KazagumoPlayer): Promise<CommandResponse> {
        if (["bassboost", "nightcore", "8d", "vaporwave", "distort", "karaoke"].every(f => !this.checkFilterState(player, f)) && !player.shoukaku.filters.timescale)
            return CommandResponse.error('All filters are already reset');
        await player.shoukaku.clearFilters();
        return CommandResponse.successText('Reset all filters');
    }

    private async handleBassboost(player: KazagumoPlayer, value: number | undefined): Promise<CommandResponse> {
        if (value && (value < 0 || value > 100)) return CommandResponse.error('Invalid value for bass boost. Must be between 0-100');
        const max = 5;
        const gain = (value || 0) / 100 * max;
        if (gain === player.shoukaku.filters.equalizer?.[0]?.gain) return CommandResponse.error(`Bass boost is already set to ${value}%`);

        player.shoukaku.filters.equalizer = new Array(2).fill(null).map((_, i) => ({band: i, gain}));
        await this.applyFilters(player);
        return CommandResponse.successText(gain ? `Set bass boost to ${value}%` : 'Disabled bass boost');
    }

    private async handleNightcore(player: KazagumoPlayer, currentState: boolean, targetState: boolean): Promise<CommandResponse> {
        if (targetState === currentState) return CommandResponse.error(`Nightcore is already ${targetState ? 'enabled' : 'disabled'}`);
        player.shoukaku.filters.timescale = targetState ? this.nightCoreTimescale : null;
        await this.applyFilters(player);
        return CommandResponse.successText(`Nightcore is now ${targetState ? 'enabled' : 'disabled'}`);
    }

    private async handleEightDimensional(player: KazagumoPlayer, currentState: boolean, targetState: boolean): Promise<CommandResponse> {
        if (targetState === currentState) return CommandResponse.error(`8d mode is already ${targetState ? 'enabled' : 'disabled'}`);
        player.shoukaku.filters.rotation = targetState ? this.eightDimensionalRotation : null;
        await this.applyFilters(player);
        return CommandResponse.successText(`8d mode is now ${targetState ? 'enabled' : 'disabled'}`);
    }

    private async handleVaporwave(player: KazagumoPlayer, currentState: boolean, targetState: boolean): Promise<CommandResponse> {
        if (targetState === currentState) return CommandResponse.error(`vaporwave mode is already ${targetState ? 'enabled' : 'disabled'}`);
        player.shoukaku.filters.timescale = targetState ? this.vaporWaveTimescale : null;
        await this.applyFilters(player);
        return CommandResponse.successText(`Vaporwave is now ${targetState ? 'enabled' : 'disabled'}`);
    }

    private async handleDistort(player: KazagumoPlayer, currentState: boolean, targetState: boolean): Promise<CommandResponse> {
        if (targetState === currentState) return CommandResponse.error(`distort mode is already ${targetState ? 'enabled' : 'disabled'}`);
        player.shoukaku.filters.distortion = targetState ? this.distortion : null;
        await this.applyFilters(player);
        return CommandResponse.successText(`Distortion is now ${targetState ? 'enabled' : 'disabled'}`);
    }

    private async handleKaraoke(player: KazagumoPlayer, currentState: boolean, targetState: boolean): Promise<CommandResponse> {
        if (targetState === currentState) return CommandResponse.error(`karaoke mode is already ${targetState ? 'enabled' : 'disabled'}`);
        player.shoukaku.filters.karaoke = targetState ? this.karaoke : null;
        await this.applyFilters(player);
        return CommandResponse.successText(`Karaoke is now ${targetState ? 'enabled' : 'disabled'}`);
    }

    private async handleTimescaleValue(
        player: KazagumoPlayer,
        key: "speed" | "pitch" | "rate",
        value: number | undefined,
        min: number,
        max: number,
        label: string,
        successLabel: string
    ): Promise<CommandResponse> {
        if (value && (value < min || value > max)) return CommandResponse.error(`Invalid value for ${key}. Must be between ${min}-${max}`);
        if (value && value === player.shoukaku.filters.timescale?.[key]) return CommandResponse.error(`${label} is already set to ${value}x`);

        player.shoukaku.filters.timescale = player.shoukaku.filters.timescale ?
            {...player.shoukaku.filters.timescale, [key]: value || 1} : value ? {[key]: value} : null;
        await this.applyFilters(player);
        return CommandResponse.successText(`Set ${successLabel} to ${value}x`);
    }

    private handleList(player: KazagumoPlayer): CommandResponse {
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