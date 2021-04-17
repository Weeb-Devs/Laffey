const handler = require('../../handlers/message');

module.exports = {
    name: 'move',
    description: 'Move song',
    usage: 'move < current song place > [ target place ]',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(new handler().normalEmbed('There\'s no music playing'))
        if (!args[0]) return message.channel.send(new handler().noArgument(client, this.name, ['move < current song place > [ target place ]']))
        if(isNaN(args[0]) || (args[1] && isNaN(args[1]))) return message.channel.send(new handler().normalEmbed('that\'s not a number'))
        player.move(parseInt(args[0]), parseInt(args[1]))
            .then(x => {
                message.react('✅').catch((_) => { })
            })
            .catch(err => {
                message.channel.send(new handler().normalEmbed(err))
            })
    }
}