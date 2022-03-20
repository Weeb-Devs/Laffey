module.exports = {
    name: 'shuffle',
    description: 'Shuffle the queue',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.length) return ctx.reply({embeds: [this.baseEmbed(`There\'s no queue left`)]});

        player.queue.shuffle();

        ctx.reply({embeds: [this.baseEmbed(`Shuffled the queue.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}