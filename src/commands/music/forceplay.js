const handler = require('../../handlers/message');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'forceplay',
    description: 'Play specific song directly',
    usage: 'forceplay [ url | query ]',
    aliases: ['fp'],
    async execute(message, args, client) {
        let player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no player. Use play command first'))
        const {channel} = message.member.voice;
        if (!channel) return message.channel.send(new handler().normalEmbed('You\'re not in a voice channel'))
        if (player && (channel.id !== player.voiceChannel)) return message.channel.send(new handler().normalEmbed('You\'re not in my voice channel'))
        if (!args[0]) return message.channel.send(new handler().noArgument(client, this.name, ['forceplay < youtube url | query | youtube playlist | spotify track | spotify playlist | spotify album | twitch >']))

        player = client.player.players.get(message.guild.id);
        const currentSong = player.queue.current;
        let search = args.join(' ');
        let res = await player.search(search, message.author)
        if (res.loadType === 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy();
            return message.channel.send(new handler().normalEmbed(`Error getting music. Please try again in a few minutes \n` + `\`\`\`${res.exception.message}\`\`\``))
        }
        switch (res.loadType) {
            case 'NO_MATCHES': {
                if (!player.queue.current) player.destroy()
                message.channel.send(new handler().normalEmbed(`No music was found`))
                break;
            }

            case 'TRACK_LOADED': {
                player.play(res.tracks[0])
                message.channel.send(new handler().normalEmbed(`Force played ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`))
                if (currentSong) player.queue.unshift(currentSong)
                break;
            }

            case 'PLAYLIST_LOADED': {
                const firstSong = res.tracks.shift();
                player.play(firstSong);
                const targetQueue = res.tracks.concat(player.queue)
                player.queue.clear()
                for (let song of targetQueue) player.queue.add(song)
                message.channel.send(new handler().normalEmbed(`Force played & queued ${res.tracks.length} songs from \`${res.playlist.name}\` [${new Date(res.playlist.duration).toISOString().slice(11, 19)}]`))
                if (currentSong) player.queue.unshift(currentSong)
                break;
            }

            case 'SEARCH_RESULT': {
                player.play(res.tracks[0])
                await message.channel.send(new handler().normalEmbed(`Force played ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`))
                if (currentSong) player.queue.unshift(currentSong)
            }
        }
    }
}