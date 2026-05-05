import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {Command} from "../Command.js";
import {CommandResponse} from "../commandResponse.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";
import {InteractionContextType} from "discord.js";

export default class nodes extends Command {
    constructor() {
        super('nodes', 'get nodes', undefined, {
            contexts: [InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild]
        });
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const fields = ctx.client.player.shoukaku.nodes.values().toArray().map(node => {
            return {
                name: node.name,
                value: [
                    '```',
                    `Player         : ${node.stats?.players}`,
                    `Playing        : ${node.stats?.playingPlayers}`,
                    `Uptime         : ${node.stats?.uptime ? new Date(node.stats?.uptime).toISOString().slice(11, 19) : '00:00:00'}`,
                    `Resevable Mem. : ${Math.round(node.stats?.memory.reservable || 0 / 1024 / 1024)}mb`,
                    `Used Memory    : ${Math.round((node.stats?.memory.used || 0) / 1024 / 1024)}mb`,
                    `Free Memory    : ${Math.round((node.stats?.memory.free || 0) / 1024 / 1024)}mb`,
                    `Allocated Mem. : ${Math.round((node.stats?.memory.allocated || 0) / 1024 / 1024)}mb`,
                    `System Load    : ${(Math.round((node.stats?.cpu.systemLoad || 0) * 100) / 100).toFixed(2)}%`,
                    `Lavalink Load  : ${(Math.round((node.stats?.cpu.lavalinkLoad || 0) * 100) / 100).toFixed(2)}%`,
                    `Cores          : ${(node.stats?.cpu.cores)}`,
                    '```'
                ].join('\n')
            }
        })

        return CommandResponse.success(new EmbedBuilder()
            .setTitle(`Nodes`)
            .addFields(fields))
    }
}