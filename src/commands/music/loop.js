module.exports = {
    name: 'loop',
    description: 'Loop the player',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        const {status} = player.toggleLoop();

        ctx.reply({embeds: [this.baseEmbed(`Now looping \`${status}\`.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}