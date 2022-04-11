module.exports = {
    name: 'move',
    description: 'Move The Selected Song',
    args: [{
        "name": "from",
        "description": "The song's current location",
        "type": 4,
        "required": true
    }, {
        "name": "to",
        "description": "The song's target location",
        "type": 4,
        "required": false
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        let from = ctx.options.getInteger("from"), to = ctx.options.getInteger("to");

        const {e, m} = await player.move(from, to).catch(e => ({e: true, m: e}));

        if (e) ctx.reply({embeds: [this.baseEmbed(`${m}`)]});
        ctx.reply({embeds: [this.baseEmbed(`Moved.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}
