const handler = require('../../handlers/message');
const {KSOFT_API_KEY} = new (require('../../modules/laffeyUtils'))();
const {MessageEmbed} = require('discord.js');
const palette = require('image-palette');
const pixels = require('image-pixels');
const {KSoftClient} = require('@ksoft/api');
const ksoft = KSOFT_API_KEY ? new KSoftClient(KSOFT_API_KEY) : null;

module.exports = {
    name: 'lyrics',
    description: 'Get specific/ urrent playing song',
    usage: 'lyrics [ title ]',
    aliases: ['ly'],
    async execute(message, args, client) {
        try {
            if (!ksoft) return message.channel.send(handler.normalEmbed('Please ask developer to add ksoft API Key'))
            const player = client.player.players.get(message.guild.id);
            if (!args[0] && !player) return message.channel.send(handler.normalEmbed('Specify a title'))
            let songTitle = args.join(' ') ? args.join(' ') : player?.queue?.current?.title;
            if (!songTitle) return message.channel.send(handler.normalEmbed('No music currently playing. Specify a title'))

            const wait = await message.channel.send(handler.normalEmbed('Searching...'))
            let err;
            const lyrics = await client.lyrics.search(songTitle).catch(() => err = true);
            if (err) return message.channel.send(handler.normalEmbed('No lyrics was found')).then(() => wait.deleted ? null : wait.delete())
            const chunked = this.chunkString(lyrics.lyrics, 1600)
            let colors = []
            if (lyrics.lyrics.artwork) {
                colors = palette(await pixels(lyrics.artwork).catch(() => {
                })).colors;
            }
            if (colors.length === 0) colors = ['#F5F5F5', '#F5F5F5', '#F5F5F5',]

            if (!wait.deleted) wait.delete()

            let embeds = []
            chunked.forEach((x, i) => {
                const embed = new MessageEmbed()
                    .setTitle(lyrics.title ? lyrics.title : 'Unknown')
                    .setDescription(`${lyrics.artist ? lyrics.artist : ''}\n\n\n${x}`)
                    .setThumbnail(lyrics.artwork ? lyrics.artwork : '')
                    .setColor(colors[i])
                    .setFooter(`Powered by ${lyrics.source}`)
                embeds.push(embed)
            })

            if (embeds.length <= 1) {
                embeds.forEach(x => message.channel.send(x))
            } else {
                let currentPage = 0
                const msg = await message.channel.send(embeds[currentPage])
                await msg.react("◀").catch(() => {
                });
                await msg.react("🇽").catch(() => {
                });
                await msg.react("▶").catch(() => {
                });
                const filter = (reaction, user) =>
                    ["◀", "🇽", "▶"].includes(reaction.emoji.name) && message.author.id === user.id;
                const collector = msg.createReactionCollector(filter, {time: 890000});
                collector.on("collect", async (reaction, user) => {
                    try {
                        if (reaction.emoji.name === "▶") {
                            if (currentPage < embeds.length - 1) {
                                currentPage++;
                                msg.edit(embeds[currentPage]);
                            }
                        } else if (reaction.emoji.name === "◀") {
                            if (currentPage !== 0) {
                                --currentPage;
                                msg.edit(embeds[currentPage]);
                            }
                        } else {
                            collector.stop();
                            msg.delete()
                        }
                        await reaction.users.remove(message.author.id).catch(() => {
                        })
                    } catch (err) {
                        console.error(err);
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }

    },
    chunkString(str, size) {
        const numChunks = Math.ceil(str.length / size)
        const chunks = new Array(numChunks)
        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size)
        }
        return chunks
    }

}