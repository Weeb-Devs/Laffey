const handler = require('../../handlers/message');

module.exports = {
    name: 'vaporwave',
    description: 'Set vaporwave for player',
    usage: 'vaporwave',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(new handler().normalEmbed('There\'s no music playing'))

        if (!player.vaporwave) {
            await player.setVaporwave(true)
            await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
            message.channel.send(new handler().normalEmbed(`Vaporwave \`ENABLED\``))
        } else {
            await player.setVaporwave(false)
            await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
            message.channel.send(new handler().normalEmbed(`Vaporwave \`DISABLED\``))
        }
    }
}