const handler = require('../../handlers/message');

module.exports = {
    name: 'pitch',
    description: 'Set pitch for player',
    usage: 'pitch',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(handler.normalEmbed('There\'s no music playing'))

        if (!args[0]) return message.channel.send(handler.normalEmbed(`**${player.pitch}x**`))
        else if (args[0].toLowerCase() === 'reset') {
            player.setPitch(1);
            message.react('👌').catch((_) => {})
            return client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
        } else {
            if (isNaN(args[0]) || Number(args[0]) > 5 || Number(args[0]) < 0) return message.channel.send(handler.normalEmbed(`Pitch must be a number and between 0 and 5`))
            player.setPitch(Number(args[0]))
            message.react('👌').catch((_) => {})
            return client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
        }
    }
}