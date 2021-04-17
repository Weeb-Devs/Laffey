const handler = require('../../handlers/message');

module.exports = {
    name: 'clear',
    description: 'Clear the queue',
    usage: 'clear',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(new handler().normalEmbed('There\'s no music playing'))
        if (player.queue.size == 0) return message.channel.send(new handler().normalEmbed('Not enough song to shuffle'))
        player.queue.clear()
                message.react('✅').catch((_) => { })
    }
}