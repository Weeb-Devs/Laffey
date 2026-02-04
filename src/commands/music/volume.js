module.exports = {
    name: 'volume',
    description: 'Set The Current Song Volume',
    args: [{
        "name": "amount",
        "description": "The amount of volume. 0-200",
        "type": 4,
        "required": true
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        const amount = ctx.options.getInteger("amount");
        if (amount < 0 || amount > 200) return ctx.reply({embeds: [this.baseEmbed(`Volume must be in a range 0-200.`)]});
        player.setVolume(parseInt(amount));

        ctx.reply({embeds: [this.baseEmbed(`Set volume to ${amount}%.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}
