const handler = require('../../handlers/message');

module.exports = {
    name: 'reset',
    description: 'Reset all active filters',
    usage: 'reset',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        player.clearEffects()
        message.react('👌').catch((_) => {})
    }
}