module.exports = {
    name: 'resume',
    description: 'Resume the player',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.paused) return ctx.reply({embeds: [this.baseEmbed(`Not paused.`)]});

        player.pause(false);

        ctx.reply({embeds: [this.baseEmbed(`Resumed the player.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}