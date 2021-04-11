const handler = require('../../handlers/message.ts');

module.exports = {
    name: 'remove',
    description: 'Remove song from queue',
    usage: 'remove < song\'s position >',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (player.queue.size == 0) return message.channel.send(new handler().normalEmbed('There\'s no song inside queue'))
        if (!args[0]) return message.channel.send(new handler().noArgument(client, this.name, ['remove < song\'s position >']))
        if (isNaN(args[0])) return message.channel.send(new handler().noArgument(client, this.name, ['remove < song\'s position >']))
        if (args[0] > player.queue.size) return message.channel.send(new handler().normalEmbed(`The queue only have ${player.queue.size} song${player.queue.size > 1 ? 's' : ''} `))
        const targetSong = player.queue[parseInt(args[0] - 1)]
        player.queue.remove((parseInt(args[0])) - 1)
        return message.channel.send(new handler().normalEmbed(`Removed [${targetSong?.title}](${targetSong?.uri}) from queue`))
    }
}