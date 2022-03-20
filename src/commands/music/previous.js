module.exports = {
    name: 'previous',
    description: 'Play previous song',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.previous) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        const currentSong = player.queue.current;
        player.play(player.queue.previous);
        if (currentSong) player.queue.unshift(currentSong);

        return ctx.reply({embeds: [this.baseEmbed(`Played the previous song.`)]});
    }
}