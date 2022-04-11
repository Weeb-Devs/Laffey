module.exports = {
    name: 'pause',
    description: 'Pause The Player',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        if (player.paused) ctx.reply({embeds: [this.baseEmbed(`The player is already paused.`)]});

        player.pause(true);
        return ctx.reply({embeds: [this.baseEmbed(`Paused the player.`)]});
    }
}
