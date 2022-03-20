const {ActionRowBuilder, SelectMenuBuilder} = require("@discordjs/builders");

module.exports = {
    name: 'search',
    description: 'Search a song',
    args: [{
        "name": "query",
        "description": "URL or query to search",
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
                let randomNumber = `${Math.round(Math.random() * 1000)}`
                let row = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(randomNumber));
                let tracks = res.tracks;

                for (let d of res.tracks.map((x, i) => ({
                    label: `${i + 1} - ${x.title.length > 50 ? x.title.substr(0, 47) : x.title}`,
                    value: `${i}`
                }))) row.components[0].addOptions(d);

                let message = await ctx.editReply({content: `Select track below`, components: [row]});

                let response = await message.awaitMessageComponent({
                    filter: (i) => i.deferUpdate().catch(_ => void 0) && i.customId === randomNumber && i.user.id === ctx.user.id,
                    time: 15 * 1000
                }).catch(_ => true);

                if (typeof response === "boolean") return message.edit({content: `No response...`, components: []});
                let track = tracks[response.values[0]]
                player.queue.add(track);
                if (!player.playing && !player.paused) player.play();
                return ctx.editReply({embeds: [this.baseEmbed(`Force played ${track.title} [${!track.isStream ? `${new Date(track.duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`)]});
            }
        }
    }
}