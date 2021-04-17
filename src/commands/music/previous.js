const handler = require('../../handlers/message');

module.exports = {
    name: 'previous',
    aliases: ['pr'],
    description: 'Play previous song',
    usage: 'previous',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.previous) return message.channel.send(new handler().normalEmbed('There\'s no music was played previously'))
        const currentSong = player.queue.current;
        player.play(player.queue.previous)
        message.react('👌')
        if (currentSong) player.queue.unshift(currentSong)
    }
}