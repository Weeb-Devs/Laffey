module.exports = {
    name: 'speed',
    description: 'Set speed filter',
    args: [{
        "name": "amount",
        "description": "The amount of speed. 0-5",
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
        if (amount < 0 || amount > 5) return ctx.reply({embeds: [this.baseEmbed(`Speed must be in a range 0-5.`)]});
        player.setSpeed(parseInt(amount));

        ctx.reply({embeds: [this.baseEmbed(`Set speed to ${amount}x.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}