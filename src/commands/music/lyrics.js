const {EmbedBuilder} = require('@discordjs/builders');
const palette = require('image-palette');
const pixels = require('image-pixels');
const Pagination = require("../../modules/Pagination");

module.exports = {
    name: 'lyrics',
    description: 'Get lyrics',
    args: [{
        "name": "title",
        "description": "The song's title to search",
        "type": 3,
        "required": false
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});

        const songTitle = ctx.options.getString("title") ? ctx.options.getString("title") : player.queue.current?.title;
        if (!songTitle) return ctx.reply({embeds: [this.baseEmbed(`Please specify the title`)]});

        await ctx.deferReply();

        const lyrics = await client.lyrics.search(songTitle).catch(_ => true);
        if (typeof lyrics === "boolean") return ctx.reply({embeds: [this.baseEmbed(`No lyrics was found`)]});

        let colors = [];
        if (lyrics.artwork) colors = palette(await pixels(lyrics.artwork).catch(_ => null)).colors;
        const embeds = this.chunkSubstr(lyrics.lyrics, 3000).map((l, i) => new EmbedBuilder()
            .setTitle(`${lyrics.title || "Unknown"}`)
            .setDescription(`${lyrics.artist || ""}\n\n\n${l}`)
            .setThumbnail(lyrics.artwork || `https://i.imgur.com/E6IhRS4.png`)
            .setColor(colors[i] || 0x23ff00)
            .setFooter({text: `Powered by ${lyrics.source}`})
        )

        return new Pagination(ctx, embeds, 360 * 1000).start();
    }
}