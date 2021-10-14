const handler = require('../../handlers/message');

module.exports = {
    name: 'loop',
    description: 'Loop the player',
    usage: 'loop',
    aliases: ['l'],
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(handler.normalEmbed('There\'s no music playing'))
        player.toggleLoop()
            .then(async x => {
                await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
                return message.channel.send(handler.normalEmbed(`Successfully, Changed the looping status to \`${x.status}\``))
            })
            .catch(err => {
                message.channel.send(handler.normalEmbed(err))
            })
    }
}
