const handler = require('../../handlers/message');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Play a song',
    usage: 'play [ url | query ]',
    aliases: ['p'],
    async execute(message, args, client) {
        let player = client.player.players.get(message.guild.id);
        const {channel} = message.member.voice;
        if (!channel) return message.channel.send(handler.normalEmbed('You\'re not in a voice channel'))
        const permissions = message.member.voice.channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send(handler.normalEmbed('I don\'t have \`CONNECT\` permission'))
        if (!permissions.has('SPEAK')) return message.channel.send(handler.normalEmbed('I don\'t have \`SPEAK\` permission'))

        if (player && (channel.id !== player?.voiceChannel)) return message.channel.send(handler.normalEmbed('You\'re not in my voice channel'))
        if (!args[0]) return message.channel.send(handler.noArgument(client, this.name, ['play < youtube url | query | youtube playlist | spotify track | spotify playlist | spotify album | twitch >']))
        if (!player) {
            player = client.player.create({
                guild: message.guild.id,
                voiceChannel: channel.id,
                textChannel: message.channel.id,
                selfDeafen: true
            });
            if (!channel.joinable) return message.channel.send(handler.normalEmbed('That channel isn\'t joinable'))
            player.connect()
        }
        player = client.player.players.get(message.guild.id);
        let search = args.join(' ');
        if (player.get('rateLimitStatus').status === true) return message.channel.send(handler.normalEmbed(`Our node (${client.player.players.get(message.guild.id).node?.options?.identifier}) is currently being rate limited. Please try again later`))
        let res = await player.search(search, message.author)
        if (res.loadType === 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy();
            return message.channel.send(handler.normalEmbed(`Error getting music. Please try again in a few minutes \n` + `\`\`\`${res.exception.message ? res.exception.message : 'No error was provided'}\`\`\``))
        }
        switch (res.loadType) {
            case 'NO_MATCHES': {
                if (!player.queue.current) player.destroy()
                await message.channel.send(handler.normalEmbed(`No music was found`))
                break;
            }

            case 'TRACK_LOADED': {
                await player.queue.add(res.tracks[0]);

                if (!player.playing && !player.paused) player.play()
                else {
                    await message.channel.send(handler.normalEmbed(`Queued ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`))
                    await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
                }
                break;
            }

            case 'PLAYLIST_LOADED': {
                await player.queue.add(res.tracks);
                if (!player.playing && !player.paused) player.play()
                else {
                    await message.channel.send(handler.normalEmbed(`Queued ${res.tracks.length} songs from \`${res.playlist.name}\` [${new Date(res.playlist.duration).toISOString().slice(11, 19)}]`))
                    await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
                }
                break;
            }

            case 'SEARCH_RESULT': {
                await player.queue.add(res.tracks[0]);

                if (!player.playing && !player.paused) player.play()
                else {
                    await message.channel.send(handler.normalEmbed(`Queued ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`))
                    await client.playerHandler.savePlayer(client.player.players.get(message.guild.id))
                }
            }

        }
    }
}