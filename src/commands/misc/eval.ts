import {Command} from "../Command.js";
import {SlashCommandStringOption} from "@discordjs/builders";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import {ConfigHandler} from "../../utils/config.js";
import util from "util";
import {EmbedBuilder} from "../../builder/embedBuilder.js";

export default class _eval extends Command {
    constructor() {
        super('eval', 'Evaluate code', [
            new SlashCommandStringOption()
                .setName('code')
                .setDescription('The code to evaluate')
                .setRequired(true)
        ]);
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        if (!ConfigHandler.owners.includes(ctx.user!.id)) return CommandResponse.none();
        const code = ctx.getString('code', -1);
        if (!code) return CommandResponse.error('No code provided');

        const embed = new EmbedBuilder()
            .setTitle('Eval Result');

        const memBefore = process.memoryUsage();
        const start = new Date().getMilliseconds();
        try {
            let evaled = eval(code);
            if (evaled instanceof Promise) evaled = await evaled;
            const memAfter = process.memoryUsage();
            const end = new Date().getMilliseconds();
            if (typeof evaled !== 'string') evaled = util.inspect(evaled, {depth: 0});
            embed
                .setDescription(`\`\`\`js\n${evaled}\n\`\`\``)
                .addFields([
                    {name: 'Execution Time', value: `${end - start} ms`, inline: true},
                    {
                        name: 'Memory Usage',
                        value: `${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`,
                        inline: true
                    }
                ]);
            return CommandResponse.success(embed);
        } catch (err) {
            const memAfter = process.memoryUsage();
            const end = new Date().getMilliseconds();
            embed
                .setDescription(`\`\`\`js\n${err instanceof Error ? err.stack : String(err)}\n\`\`\``)
                .addFields([
                    {name: 'Execution Time', value: `${end - start} ms`, inline: true},
                    {
                        name: 'Memory Usage',
                        value: `${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`,
                        inline: true
                    }
                ])
                .setColor(ConfigHandler.getEmbedColor('error'))
            return CommandResponse.success(embed);
        }
    }
}