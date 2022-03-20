const {EmbedBuilder} = require("@discordjs/builders");

module.exports = {
    name: 'filters',
    description: 'Get all active filters',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});

        const embed = new EmbedBuilder()
            .setTitle("Filters")
            .setColor(0xFF0000)
            .setDescription([
                `Speed: **${player.speed}x**`,
                `Pitch: **${player.pitch}x**`,
                `Bassboost: **${player.bassboost ? `${player.bassboost * 100}%` : 'disabled'}**`,
                `Nightcore: **${player.nightcore ? 'enabled' : 'disabled'}**`,
                `8d: **${player._8d ? 'enabled' : 'disabled'}**`,
                `Vaporwave: **${player.vaporwave ? 'enabled' : 'disabled'}**`,
                `Volume: **${player.volume}%**`
            ].join("\n"))

        return ctx.reply({embeds: [embed]});
    }
}