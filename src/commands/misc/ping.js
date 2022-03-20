module.exports = {
    name: "ping",
    description: "Check if the bot is online or not",
    args: [],
    async execute(ctx, client) {
        return ctx.reply({embeds: [this.baseEmbed(`Pong! ${client.ws.ping}ms.`)]});
    }
}