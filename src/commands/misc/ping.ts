import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import {InteractionContextType} from "discord.js";

export default class ping extends Command {
    constructor() {
        super('ping', 'Get the bot ping', undefined, {
            contexts: [InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild]
        });
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        return CommandResponse.successText(`Pong! \`${ctx.client.ws.ping}ms\``);
    }
}