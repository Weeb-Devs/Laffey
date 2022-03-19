const handler = require('../../handlers/message');

module.exports = {
    name: 'skip',
    description: 'Skip current song',
    usage: 'skip',
    aliases: ['s'],
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(handler.normalEmbed('There\'s no music playing'))
        player.skip()
            .then(x => {
                message.react('⏭').catch(() => { })
            })
            .catch(err => {
                message.channel.send(handler.normalEmbed(err))
            })
    }
}