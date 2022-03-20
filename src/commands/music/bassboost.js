module.exports = {
    name: 'bassboost',
    description: 'Set bassboost filter',
    args: [{
        "name": "amount",
        "description": "The amount of bass boost. 0-200",
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
        player.setBassboost(amount ? parseInt(amount) / 100 : false);

        ctx.reply({embeds: [this.baseEmbed(`Set bass boost to ${amount ? `${amount}%` : "disabled"}.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}