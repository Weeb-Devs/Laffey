const handler = require('../../handlers/message');

module.exports = {
    name: 'bassboost',
    description: 'Set bassboost for player',
    aliases: ['bb'],
    usage: 'bassboost [0-100]',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(handler.normalEmbed('There\'s no music playing'))

        if (!args[0]) {
            return message.channel.send(handler.normalEmbed(`**${player.bassboost ? `${player.bassboost * 100}%` : 'off'}**`))
        } else if (args[0].toLowerCase() === 'reset') {
            player.setBassboost(false)
            await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
            message.react('✅').catch(() => { })
        } else {
            if (isNaN(args[0])) return message.channel.send(handler.normalEmbed(`That isn't a number`))
            if (args[0] > 2000 || args[0] < 0) return message.channel.send(handler.normalEmbed(`Invalid range. **1-1000**`))
            player.setBassboost(parseInt(args[0]) / 100)
            await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
            return message.channel.send(handler.normalEmbed(`**${player.bassboost * 100}%**`))
        }
    }
}