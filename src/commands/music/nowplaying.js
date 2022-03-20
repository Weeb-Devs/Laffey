const {EmbedBuilder} = require("@discordjs/builders");
const {splitBar} = require("string-progressbar");
module.exports = {
    name: 'nowplaying',
    description: 'Get now playing',
    args: [],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId);
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`There\'s no active player`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`There\'s no music playing`)]});
        if (player.get("nowplaying")) {
            clearInterval(player.get("nowplaying"));
            player.get("nowplayingMSG").delete().catch(_ => void 0);
        }

        let musicLength = player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.duration || isNaN(player.queue.current.duration)) ? null : player.queue.current.duration),
            nowTime = (!player.position || isNaN(player.position)) ? null : player.position;

        const embed = (p, l, n) => new EmbedBuilder()
            .setTitle(`Nowplaying - ${p.queue.current.title}`)
            .setURL(p.queue.current.uri)
            .setThumbnail(p.queue.current.thumbnail || 'https://i.imgur.com/E6IhRS4.png')
            .setDescription(`[${p.queue.current.isStream ? '◉ LIVE' : `${new Date(p.position).toISOString().slice(11, 19)}`}]` +
                splitBar(l ? Number(l) : 1, n ? Number(n) : 2, 26, '=', 'X')[0] +
                `[${p.queue.current.isStream ? '◉ LIVE' : `${new Date(p.queue.current.duration).toISOString().slice(11, 19)}`}]`)
            .setFooter({text: `${new Date(l - n).toISOString().slice(11, 19) + ' left'}`})
            .setColor(0x00C7FF)

        ctx.reply({embeds: [embed(player, musicLength, nowTime)]}).then(m => player.set("nowplayingMSG", m));

        const interval = setInterval(() => {
            player = client.player.players.get(ctx.guildId);
            let musicLength = player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.duration || isNaN(player.queue.current.duration)) ? null : player.queue.current.duration),
                nowTime = (!player.position || isNaN(player.position)) ? null : player.position;

            return player ? player.get("nowplayingMSG") ? player.get("nowplayingMSG").edit({embeds: [embed(player, musicLength, nowTime)]}).catch(_ => clearInterval(interval)) : void 0 : clearInterval(interval);
        }, 5000);
        player.set("nowplaying", interval);
    }
}