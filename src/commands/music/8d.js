module.exports = {
    name: '8d',
    description: 'Enable/Disable 8d Filters',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        player.set8D(!player._8d);
        ctx.reply({embeds: [this.baseEmbed(`${player._8d ? "enabled" : "disabled"}\` 8d filter.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}
