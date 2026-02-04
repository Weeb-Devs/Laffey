module.exports = {
    name: "ping",
    description: "Returns my websocket ping",
    args: [],
    async execute(ctx, client) {
        return ctx.reply({embeds: [this.baseEmbed(`Pong! ${client.ws.ping}ms.`)]});
    }
}
