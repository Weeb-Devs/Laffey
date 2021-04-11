const handler = require('../../handlers/message.ts');


module.exports = {
    name: 'volume',
    description: 'Set volume of the player',
    usage: 'volume [ value ]',
    aliases: ['v'],
    async execute(message, args, client) {
        try {
            const player = client.player.players.get(message.guild.id);
            if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
            if (!args[0]) return message.channel.send(new handler().normalEmbed(`**${player.volume}**%`))
            if (isNaN(args[0])) return message.channel.send(new handler().noArgument(client, this.name, ['volume [ 0-1000 ]']))
            if (args[0] < 0 || args[0] > 1000) return message.channel.send(new handler().noArgument(client, this.name, ['volume [ 0-1000 ]']))
            player.setVolume(parseInt(args[0]))
            return message.channel.send(new handler().normalEmbed('Set the volume to **' + args[0] + '%**'))
        } catch (err) {
            Handler.sendError(message, `Oops, there was an error! ` + err)
        }
    }
};
