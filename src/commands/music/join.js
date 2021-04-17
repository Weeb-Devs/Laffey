const handler = require('../../handlers/message');

module.exports = {
    name: 'join',
    description: 'Join voice channel',
    usage: 'join',
    async execute(message, args, client) {
        let player = client.player.players.get(message.guild.id);
        const { channel } = message.member.voice;
        if (!channel) return message.channel.send(new handler().normalEmbed('You\'re not in a voice channel'))

        if (!player || (player && !player.voiceChannel)) {
            player = client.player.create({
                guild: message.guild.id,
                voiceChannel: channel.id,
                textChannel: message.channel.id,
                selfDeafen: true
            });
            if (!channel.joinable) return message.channel.send(new handler().normalEmbed('That channel isn\'t joinable'))
            player.connect()
            message.react('✋').catch((_) => { })
        } else return message.channel.send(new handler().normalEmbed('\'m in another channel'))
    }
}