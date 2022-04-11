module.exports = {
    name: '24h',
    description: 'Enable/Disable 24/7 playing',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        const {status} = player.get("24h");
        player.set("24h", {status: !status});

        ctx.reply({embeds: [this.baseEmbed(`${!status ? "enabled" : "disabled"}\ **24/7.**`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}
