const {EmbedBuilder} = require("@discordjs/builders");
const Pagination = require("../../modules/Pagination");

module.exports = {
    name: 'queue',
    description: 'See the current queue',
    args: [],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId);
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});

        let j = 0;

        let embeds = this.chunkArray(player.queue, 10).map((d) => new EmbedBuilder()
            .setDescription(player.queue.length && d.filter(x => !!x).length ?
                (() => {
                    const info = d.filter(x => !!x).map((track) => {
                        let trackTitle = track?.title.length >= 45 ? `${track?.title.slice(0, 45)}...` : track?.title
                        return `${++j} - ${trackTitle}${' '.repeat((48 - (trackTitle.length)))} ${track.isStream ? '◉ LIVE' : ((track.duration || !isNaN(track.duration)) ? new Date(parseInt(track.duration)).toISOString().slice(11, 19) : 'Unknown')}`
                    }).join("\n");

                    return `Current song: ${player.queue.current.title}\n\n` +
                        `${info ? info : 'Not detected'}\n`

                })()
                : `Current song: ${player.queue.current.title}\n\n` +
                `Add more song by using play command :D\n`)
        )
        if (!embeds.length) embeds = [new EmbedBuilder().setTitle("Queue").setDescription(`Current song: ${player.queue.current.title}\n\n Add more song by using play command :D\n`)]

        await ctx.deferReply();
        return new Pagination(ctx, embeds, 360 * 1000).start();
    }
}
