const handler = require('../../handlers/message');

module.exports = {
    name: '24h',
    description: 'bot whether to leave vc when there\'s user inside vc or not',
    usage: '8d',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        const { status } = player.get('24h');
        player.set('24h', { status: !status })
        await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
        message.channel.send(handler.normalEmbed(`24h \`${status ? 'ENABLED' : 'DISABLED'}\``))
    }
}
