module.exports = {
    name: 'forceplay',
    description: 'Playing A Song Without Queueing',
    args: [{
        "name": "query",
        "description": "URL or query to play",
        "type": 3,
        "required": true
    }],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId),
            query = ctx.options.getString("query");
        const {channel} = ctx.member.voice;

        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There's no player.`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});

        if (player.get('rateLimitStatus').status === true) return ctx.reply({embeds: [this.baseEmbed(`Our node is currently rate limited. Please try again later.`)]});
        const currentSong = player.queue.current;
        await ctx.deferReply();

        let res = await player.search(query, ctx.user)
        if (res.loadType === 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy();
            return ctx.editReply({embeds: [this.baseEmbed(`Error getting music. Please try again in a few minutes \n` + `\`\`\`${res.exception.message ? res.exception.message : 'No error was provided'}\`\`\``)]});
        }
        switch (res.loadType) {
            case 'NO_MATCHES': {
                if (!player.queue.current) player.destroy()
                return ctx.editReply({embeds: [this.baseEmbed(`No music was found.`)]});
            }

            case 'TRACK_LOADED':
            case 'SEARCH_RESULT': {
                player.play(res.tracks[0]);
                if (currentSong) player.queue.unshift(currentSong);
                return ctx.editReply({embeds: [this.baseEmbed(`Force played ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`)]});
            }

            case 'PLAYLIST_LOADED': {
                player.play(res.tracks.shift());
                const targetQueue = res.tracks.concat(player.queue);
                player.queue.clear();
                for (let song of targetQueue) player.queue.add(song);
                if (currentSong) player.queue.unshift(currentSong);

                return ctx.editReply({embeds: [this.baseEmbed(`Force played & queued ${res.tracks.length} songs from \`${res.playlist.name}\` [${new Date(res.playlist.duration).toISOString().slice(11, 19)}]`)]});
            }
        }
    }
}
