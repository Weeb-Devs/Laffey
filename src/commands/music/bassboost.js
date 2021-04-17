const handler = require('../../handlers/message');

module.exports = {
    name: 'bassboost',
    description: 'Set bassboost for player',
    aliases: ['bb'],
    usage: 'bassboost [0-100]',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(new handler().normalEmbed('There\'s no music playing'))

        if (!args[0]) {
            message.channel.send(new handler().normalEmbed(`**${player.bassboost ? `${player.bassboost * 100}%` : 'off'}**`))
        } else if (args[0].toLowerCase() == 'reset') {
            player.setBassboost(false)
            message.react('✅').catch((_) => { })
        } else {
            if (isNaN(args[0])) return message.channel.send(new handler().normalEmbed(`That isn't a number`))
            if (args[0] > 2000 || args[0] < 0) return message.channel.send(new handler().normalEmbed(`Invalid range. **1-1000**`))
            player.setBassboost(parseInt(args[0]) / 100)
            message.channel.send(new handler().normalEmbed(`**${player.bassboost * 100}%**`))
        }
    }
}