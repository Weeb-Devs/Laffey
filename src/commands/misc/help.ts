import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {Command} from "../Command.js";
import {CommandResponse} from "../commandResponse.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";

export default class help extends Command {
    constructor() {
        super('help', 'get help')
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
