const {MessageEmbed} = require("discord.js");
const handler = require('../../handlers/message');

module.exports = {
    name: 'filters',
    description: 'Get all filters status',
    usage: 'filters',
    async execute(message, args, client) {
        const player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'))

        const embed = new MessageEmbed()
            .setAuthor('Filters', client.user.displayAvatarURL())
            .setColor(message.guild.me.roles.highest.color)
            .setDescription([
                `Speed: **${player.speed}x**`,
                `Pitch: **${player.pitch}x**`,
                `Bassboost: **${player.bassboost ? `${player.bassboost * 100}%` : 'disabled'}**`,
                `Nightcore: **${player.nightcore ? 'enabled' : 'disabled'}**`,
                `8d: **${player._8d ? 'enabled' : 'disabled'}**`,
                `Vaporwave: **${player.vaporwave ? 'enabled' : 'disabled'}**`,
                `Volume: **${player.volume}%**`
            ])
        return message.channel.send({embed})
    }
}