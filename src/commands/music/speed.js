const handler = require('../../handlers/message');

module.exports = {
    name: 'speed',
    description: 'Set speed for player',
    usage: 'speed',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(handler.normalEmbed('There\'s no music playing'))

        if (!args[0]) return message.channel.send(handler.normalEmbed(`**${player.speed}x**`))
        else if (args[0].toLowerCase() === 'reset') {
            player.setSpeed(1);
            message.react('👌').catch((_) => {})
            return client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
        } else {
            if (isNaN(args[0]) || Number(args[0]) > 5 || Number(args[0]) < 0) return message.channel.send(handler.normalEmbed(`Speed must be a number and between 0 and 5`))
            player.setSpeed(Number(args[0]))
            message.react('👌').catch((_) => {})
            return client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
        }
    }
}