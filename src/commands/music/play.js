module.exports = {
    name: 'play',
    description: 'Play The Requested Song',
    args: [{
        "name": "query",
        "description": "URL or query to play",
        "type": 3,
        "required": true
    }],
    async execute(ctx, client) {
        try {

            let player = client.player.players.get(ctx.guildId),
                query = ctx.options.getString("query");
            const {channel} = ctx.member.voice;

            if (!channel) return ctx.reply({embeds: [this.baseEmbed(`You're not in a voice channel.`)]});

            const permissions = ctx.member.voice.channel.permissionsFor(client.user);
            if (!permissions.has(['Connect', 'Speak'])) return ctx.reply({embeds: [this.baseEmbed(`I don't have either \`Connect\` or \`Speak\` to execute this command.`)]});

            if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`You're not in my voice channel.`)]});

            if (!player) {
                player = client.player.create({
                    guild: ctx.guildId,
                    voiceChannel: channel.id,
                    textChannel: ctx.channel.id,
                    selfDeafen: true
                });
                player.connect()
            }
            player = client.player.players.get(ctx.guildId);

            if (player.get('rateLimitStatus').status === true) return ctx.reply({embeds: [this.baseEmbed(`Our node is currently rate limited. Please try again later.`)]});
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

                case 'TRACK_LOADED': {
                    await player.queue.add(res.tracks[0]);

                    if (!player.playing && !player.paused) player.play()
                    await client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
                    return ctx.editReply({embeds: [this.baseEmbed(`Queued ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`)]});
                }

                case 'PLAYLIST_LOADED': {
                    await player.queue.add(res.tracks);
                    if (!player.playing && !player.paused) player.play()
                    await client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
                    return ctx.editReply({embeds: [this.baseEmbed(`Queued ${res.tracks.length} songs from \`${res.playlist.name}\` [${new Date(res.playlist.duration).toISOString().slice(11, 19)}]`)]});
                }

                case 'SEARCH_RESULT': {
                    await player.queue.add(res.tracks[0]);

                    if (!player.playing && !player.paused) player.play()
                    await client.playerHandler.savePlayer(client.player.players.get(ctx.guildId))
                    return ctx.editReply({embeds: [this.baseEmbed(`Queued ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`)]})
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
}
