import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {Command} from "../Command.js";
import {CommandResponse} from "../commandResponse.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";

export default class nodes extends Command {
    constructor() {
        super('nodes', 'get nodes');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        const all = ctx.client.player.shoukaku.nodes.values().toArray().map(node =>
            `**Node ${(node.name)}**` +
            `\nPlayer: ${node.stats?.players}` +
            `\nPlaying Players: ${node.stats?.playingPlayers}` +
            `\nUptime: ${node.stats?.uptime ? new Date(node.stats?.uptime).toISOString().slice(11, 19) : '00:00:00'}` +
            `\n\nMemory` +
            `\nReservable Memory: ${Math.round(node.stats?.memory.reservable || 0 / 1024 / 1024)}mb` +
            `\nUsed Memory: ${Math.round((node.stats?.memory.used || 0) / 1024 / 1024)}mb` +
            `\nFree Memory: ${Math.round((node.stats?.memory.free || 0) / 1024 / 1024)}mb` +
            `\nAllocated Memory: ${Math.round((node.stats?.memory.allocated || 0) / 1024 / 1024)}mb` +
            "\n\nCPU" +
            `\nCores: ${(node.stats?.cpu.cores)}` +
            `\nSystem Load: ${(Math.round((node.stats?.cpu.systemLoad || 0) * 100) / 100).toFixed(2)}%` +
            `\nLavalink Load: ${(Math.round((node.stats?.cpu.lavalinkLoad || 0) * 100) / 100).toFixed(2)}%`
        ).join('\n\n\n');

        return CommandResponse.success(new EmbedBuilder()
            .setTitle(`Nodes`)
            .setDescription(`${all}`))
    }
}