const handler = require('../../handlers/message.ts');

module.exports = {
    name: 'skipto',
    description: 'Skip to selected song',
    usage: 'skipto < song >',
    aliases: ['st', 'jump', 'jumpto'],
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(new handler().normalEmbed('There\'s no music playing'))
        if (!args[0]) return message.channel.send(new handler().noArgument(client, this.name, ['skipto < song >']))
        if(isNaN(args[0])) return message.channel.send(new handler().normalEmbed('That\'s not a number'))
        player.skipto(parseInt(args[0]))
            .then(x => {
                message.react('⏩').catch((_) => { })
            })
            .catch(err => {
                message.channel.send(new handler().normalEmbed(err))
            })
    }
}