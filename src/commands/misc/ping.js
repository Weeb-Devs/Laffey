const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'ping',
    description: 'Get bot\'s ping',
    usage: 'ping',
    async execute(message, args, client) {
        let embed = new MessageEmbed()
            .setAuthor('🏓 Pinging')
            .addField('API Latency', '❔')
            .addField('Roundtrip', '❔')
            .addField('Websocket', '❔')
            .setColor('#FFFF00')
        const g = await message.channel.send(embed)

        embed = new MessageEmbed()
            .setAuthor('🏓 Pong!')
            .addField('API Latency', `${this.getEmoji(g.createdTimestamp - message.createdTimestamp)} ${g.createdTimestamp - message.createdTimestamp}ms`)
            .addField('Roundtrip', `${this.getEmoji(new Date() - message.createdTimestamp)} ${new Date() - message.createdTimestamp}ms`)
            .addField('Websocket', `${this.getEmoji(client.ws.ping)} ${client.ws.ping}ms`)
            .setColor('#0077be')
        g.edit("",embed)
    },
    getEmoji(amount) {
        let emoji;
        if (amount <= 120) {
            emoji = '🟢'
        } else if (amount <= 800) {
            emoji = '🟡'
        } else {
            emoji = '🔴'
        }
        return emoji;
    }
}
