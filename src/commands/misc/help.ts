import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {Command} from "../Command.js";
import {CommandResponse} from "../commandResponse.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";
import {InteractionContextType} from "discord.js";

export default class help extends Command {
    constructor() {
        super('help', 'get help', undefined, {
            contexts: [InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild]
        });
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const description = ctx.commands.map(_cmd => {
            const cmd = _cmd.build();
            return `- **${cmd.name}:** ${(cmd as any).description}`;
        }).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('Help')
            .setDescription(description);
        return CommandResponse.success(embed);
    }
}
