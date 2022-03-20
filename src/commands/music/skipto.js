module.exports = {
    name: 'skipto',
    description: 'Skipto specific song',
    args: [{
        "name": "position",
        "description": "Song's position to play",
        "type": 4,
        "required": true
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.length) return ctx.reply({embeds: [this.baseEmbed(`There\'s no queue left`)]});

        let position = ctx.options.getInteger("position");

        const {e, m} = await player.skipto(position).catch(_ => ({e: true, m: _}));
        if (e) return ctx.reply({embeds: [this.baseEmbed(`${m}`)]});

        return ctx.reply({embeds: [this.baseEmbed(`Skipped.`)]});
    }
}