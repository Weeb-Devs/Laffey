module.exports = {
    name: 'remove',
    description: 'Remove a song from the queue',
    args: [{
        "name": "position",
        "description": "The song's position",
        "type": 4,
        "required": true
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        let position = ctx.options.getInteger("position");
        if (position > player.queue.size) return ctx.reply({embeds: [this.baseEmbed(`The given position is too big.`)]});

        const targetSong = player.queue[position - 1]
        player.queue.remove((parseInt(position)) - 1)

        ctx.reply({embeds: [this.baseEmbed(`Removed ${targetSong.title} from queue.`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}
