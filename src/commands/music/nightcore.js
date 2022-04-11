module.exports = {
    name: 'nightcore',
    description: 'Enable/Disable Nightcore Filters',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        player.setNightcore(!player.nightcore);
        ctx.reply({embeds: [this.baseEmbed(`${!player.nightcore ? "enabled" : "disabled"}\` nightcore filter.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}
