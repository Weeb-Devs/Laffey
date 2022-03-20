module.exports = {
    name: 'leave',
    description: 'Leave a voice channel',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (channel.id !== player?.voiceChannel) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});

        player.destroy();

        ctx.reply({embeds: [this.baseEmbed(`Left the voice channel.`)]});
        return client.playerHandler.delete(client.player.players.get(ctx.guildId));
    }
}