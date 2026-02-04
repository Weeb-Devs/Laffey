module.exports = {
    name: 'reset',
    description: 'Set All Filters To Default',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});

        player.clearEffects();

        ctx.reply({embeds: [this.baseEmbed(`Reset the filters.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}
