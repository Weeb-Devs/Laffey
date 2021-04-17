const handler = require('../../handlers/message');

module.exports = {
    name: "resume",
    description: "Resume the player",
    aliases: ['r'],
    usage: "resume",
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id)
        if (!player) return message.channel.send(new handler().normalEmbed(`There's nothing playing`))
        const { channel } = message.member.voice
        if (!channel) return message.channel.send(new handler().normalEmbed(`You're not in a voice channel`))
        if (player && (channel.id != player?.voiceChannel)) return message.channel.send(new handler().normalEmbed('You\'re not in my voice channel'))
        player.pause(false)
        message.react('✅').catch((_) => { })
    }
};