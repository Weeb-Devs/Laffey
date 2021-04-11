const handler = require('../../handlers/message.ts');
const createBar = require('string-progressbar');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'nowplaying',
    description: 'Get now playing song',
    usage: 'nowplaying',
    aliases: ['np'],
    async execute(message, args, client) {
        let player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no active player'))
        if (!player.queue.current) return message.channel.send(new handler().normalEmbed('There\'s no music playing'))
        if (player.get('nowplaying')) { clearInterval(player.get('nowplaying')); player.get('nowplayingMSG').delete().catch(() => { }) }

        const musicLength = (player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.duration || isNaN(player.queue.current.duration)) ? null : player.queue.current.duration))
        const nowTime = (!player.position || isNaN(player.position)) ? null : player.position
        const embed = new MessageEmbed()
            .setAuthor('Nowplaying', client.user.displayAvatarURL())
            .setTitle(player.queue.current.title)
            .setURL(player.queue.current.uri)
            .setThumbnail(player.queue.current?.thumbnail ? player.queue.current?.thumbnail : '')
            .setFooter(new Date(musicLength - nowTime).toISOString().slice(11, 19) + ' left')
            .setColor(message.guild.me.displayHexColor != '#000000' ? message.guild.me.displayHexColor : '#00C7FF')
            .setDescription(`[${player.queue.current.isStream ? '◉ LIVE' : `${new Date(player.position).toISOString().slice(11, 19)}`}]` +
                createBar(musicLength ? Number(musicLength) : 1, nowTime ? Number(nowTime) : 2, 26, '=', 'X')[0] +
                `[${player.queue.current.isStream ? '◉ LIVE' : `${new Date(player.queue.current.duration).toISOString().slice(11, 19)}`}]`)
        message.channel.send(embed).then(msg => player.set('nowplayingMSG', msg))


        const interval = setInterval(() => {
            player = client.player.players.get(message.guild.id);
            const musicLength = (player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.duration || isNaN(player.queue.current.duration)) ? null : player.queue.current.duration))
            const nowTime = (!player.position || isNaN(player.position)) ? null : player.position
            const embed = new MessageEmbed()
                .setAuthor('Nowplaying', client.user.displayAvatarURL())
                .setTitle(player.queue.current.title)
                .setURL(player.queue.current.uri)
                .setThumbnail(player.queue.current?.thumbnail ? player.queue.current?.thumbnail : '')
                .setFooter(new Date(musicLength - nowTime).toISOString().slice(11, 19) + ' left')
                .setColor(message.guild.me.displayHexColor != '#000000' ? message.guild.me.displayHexColor : '#00C7FF')
                .setDescription(`[${player.queue.current.isStream ? '◉ LIVE' : `${new Date(player.position).toISOString().slice(11, 19)}`}]` +
                    createBar(musicLength ? Number(musicLength) : 1, nowTime ? Number(nowTime) : 2, 26, '=', 'X')[0] +
                    `[${player.queue.current.isStream ? '◉ LIVE' : `${new Date(player.queue.current.duration).toISOString().slice(11, 19)}`}]`)

            player?.get('nowplayingMSG') ? player.get('nowplayingMSG').edit(embed) : message.channel.send(embed).then(msg => player.set('nowplayingMSG', msg))
        }, 5000);
        player.set('nowplaying', interval)
    }
}