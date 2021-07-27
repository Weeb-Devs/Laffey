const handler = require('../../handlers/message');

module.exports = {
    name: 'nightcore',
    description: 'Set nightcore for player',
    aliases: ['nc'],
    usage: 'nightcore',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(new handler().normalEmbed('There\'s no music playing'))

        if (!player.nightcore) {
            await player.setNightcore(true)
            await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
            return message.channel.send(new handler().normalEmbed(`Nightcore \`ENABLED\``))
        } else {
            await player.setNightcore(false)
            await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
            return message.channel.send(new handler().normalEmbed(`Nightcore \`DISABLED\``))
        }
    }
}