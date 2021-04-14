const handler = require('../../handlers/message.ts');

module.exports = {
    name: '24h',
    description: 'bot whether to leave vc when there\'s user inside vc or not',
    usage: '8d',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (player.get('24h').status == false) {
            player.set('24h', { status: true })
            message.channel.send(new handler().normalEmbed(`24h \`ENABLED\``))
        } else {
            player.set('24h', { status: false })
            message.channel.send(new handler().normalEmbed(`24h \`DISABLED\``))
        }
    }
}