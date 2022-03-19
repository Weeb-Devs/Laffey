module.exports = {
    name: 'invite',
    aliases: ['inv'],
    usage: 'invite',
    description: 'Give you a link to invite this bot',
    async execute(message, args, client) {
        message.channel.send(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=36768832&scope=bot`)
    }
}