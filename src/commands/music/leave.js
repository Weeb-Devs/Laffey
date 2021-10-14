const handler = require('../../handlers/message');

module.exports = {
    name: 'leave',
    aliases: ['stop'],
    description: 'Leave voice channel',
    usage: 'leave',
    async execute(message, args, client) {
        let player = client.player.players.get(message.guild.id);
        const { channel } = message.member.voice;
        if(!player) return message.channel.send(handler.normalEmbed('I\'m not in a voice channel'))
        if (!channel) return message.channel.send(handler.normalEmbed('You\'re not in a voice channel'))
        if (channel.id != player.voiceChannel) return message.channel.send(handler.normalEmbed('You\'re not in my voice channel'))
        player.destroy()
        message.react('👋').catch(() => { })
    }
}