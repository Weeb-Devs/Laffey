const handler = require('../../handlers/message');

module.exports = {
    name: 'shuffle',
    description: 'Shuffle the song in queue',
    usage: 'shuffle',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(handler.normalEmbed('There\'s no music playing'))
        if (player.queue.size === 0) return message.channel.send(handler.normalEmbed('Not enough song to shuffle'))
        player.queue.shuffle()
        await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
        message.react('🔀').catch(() => { })
    }
}