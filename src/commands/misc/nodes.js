const {EmbedBuilder} = require('@discordjs/builders');

module.exports = {
    name: "nodes",
    description: "Get node status",
    args: [],
    async execute(ctx, client) {
        const all = client.player.nodes.map(node => 
            `**Node ${(node.options.identifier)}**` +
            `\nPlayer: ${node.stats.players}` +
            `\nPlaying Players: ${node.stats.playingPlayers}` +
            `\nUptime: ${new Date(node.stats.uptime).toISOString().slice(11, 19)}` +
            `\n\nMemory` +
            `\nReservable Memory: ${Math.round(node.stats.memory.reservable / 1024 / 1024)}mb` +
            `\nUsed Memory: ${Math.round(node.stats.memory.used / 1024 / 1024)}mb` +
            `\nFree Memory: ${Math.round(node.stats.memory.free / 1024 / 1024)}mb` +
            `\nAllocated Memory: ${Math.round(node.stats.memory.allocated / 1024 / 1024)}mb` +
            "\n\nCPU" +
            `\nCores: ${node.stats.cpu.cores}` +
            `\nSystem Load: ${(Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2)}%` +
            `\nLavalink Load: ${(Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2)}%`
        ).join('\n\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`Nodes`)
            .setDescription(`${all}`)
	        .setColor(0xFF0000)

        return ctx.reply({embeds: [embed]});
    }
}