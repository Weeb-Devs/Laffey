import {
    type BaseInteraction,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
    REST,
    Routes
} from "discord.js";
import * as fs from "node:fs";
import * as path from "node:path";
import type {Command} from "../commands/Command.js";
import {InteractionAdapter} from "../adapter/InteractionAdapter.js";
import type {Laffey} from "../Laffey.js";
import {CommandResponse, CommandResponseType} from "../commands/commandResponse.js";
import {Pagination} from "../utils/pagination.js";
import {ConfigHandler} from "../utils/config.js";
import {Logger} from "../utils/logger.js";

export class CommandService {
    private commands: Map<string, Command> = new Map();
    private rest = new REST({version: "10"}).setToken(ConfigHandler.token ?? "");

    constructor(private readonly client: Laffey) {
    }

    public async loadCommands(): Promise<void> {
        const isDevTsRuntime = process.env.IS_DEV === "true";
        const baseCommands = path.join("src", "commands");

        const ext = isDevTsRuntime ? ".ts" : ".js";
        const categories = fs.readdirSync(baseCommands);

        let categoryCount = 0;
        for (const category of categories) {
            const categoryPath = path.join(baseCommands, category);
            if (!fs.statSync(categoryPath).isDirectory()) continue;
            categoryCount++;
            const commands = fs.readdirSync(categoryPath).filter((x) => x.endsWith(ext));

            for (const file of commands) {
                const fullPath = path.join(process.cwd(), categoryPath, file);

                const modUrl = `file://${fullPath}?t=${Date.now()}`;
                const mod = await import(modUrl);
                const cmd = new mod.default() as Command;
                const builtCmd = cmd.build();
                this.commands.set(builtCmd.name, cmd);
                Logger.debug(`Loaded ${category} => ${builtCmd.name}`, 'Command');
            }
        }
        Logger.log(`Loaded ${categoryCount} categories, ${this.commands.entries().toArray().length} commands`, 'Command');

        // const response = await this.rest.put(
        //     Routes.applicationGuildCommands(process.env.CLIENT_ID!, '1224701527013457950'),
        //     {body: this.commands.values().toArray().map(x => x.build())}
        // );
        // console.log(response);
    }

    public async handleMessage(ctx: Message) {
        const prefix = ConfigHandler.prefix;
        if (!prefix || prefix.length === 0 || !ctx.content.startsWith(prefix)) return;
        const args = ctx.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()!.toLowerCase();

        const command = this.commands.get(commandName);
        if (!command) return ctx.reply(`Unknown command ${commandName}`);

        const interaction = new InteractionAdapter(this.client, undefined, ctx);
        try {
            const response = await command.execute(interaction);
            if (response.type === CommandResponseType.search) return this.client.search.handle(ctx, interaction, response);

            const msg = await ctx.reply({embeds: response.type === CommandResponseType.paginated ? [response.embeds[0]!] : response.embeds});
            if (msg) await this.postSend(msg, ctx, interaction, response);
        } catch (e) {
            Logger.errorStack(`Error occurred while executing command: ${commandName}`, 'Command', e as Error);
            return ctx.reply("An error occurred while executing the command");
        }
    }

    public async handleInteraction(ctx: BaseInteraction) {
        if (!(ctx instanceof ChatInputCommandInteraction)) return;

        const command = this.commands.get(ctx.commandName);
        if (!command) return ctx.reply(`Unknown command ${ctx.commandName}`);


        const interaction = new InteractionAdapter(this.client, ctx);
        try {
            const response = await command.execute(interaction);
            if (response.type === CommandResponseType.search) return this.client.search.handle(ctx, interaction, response);

            const msg = ctx.deferred ?
                await ctx.editReply({embeds: response.type === CommandResponseType.paginated ? [response.embeds[0]!] : response.embeds}) :
                await ctx.reply({embeds: response.type === CommandResponseType.paginated ? [response.embeds[0]!] : response.embeds});
            if (msg) await this.postSend(msg, ctx, interaction, response);
        } catch (e) {
            Logger.errorStack(`Error occurred while executing command: ${ctx.commandName}`, 'Laffey', e as Error);
            return ctx.deferred ?
                ctx.editReply("An error occurred while executing the command") :
                ctx.reply("An error occurred while executing the command");
        }
    }

    private async postSend(msg: Message | InteractionResponse, ctx: BaseInteraction | Message, interaction: InteractionAdapter, response: CommandResponse) {
        switch (response.type) {
            case CommandResponseType.nowplaying:
                this.client.player.getPlayer(ctx.guildId!)?.data.set('nowplaying.msg', msg);
                break;
            case CommandResponseType.paginated:
                const pagination = new Pagination(msg, interaction, response.embeds);
                await pagination.start().catch(() => Logger.error("Failed to start pagination", "Command"));
        }
    }
}