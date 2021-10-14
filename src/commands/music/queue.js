const { MessageEmbed } = require("discord.js");
const handler = require('../../handlers/message');

module.exports = {
    name: "queue",
    aliases: ["q"],
    description: "Show the music queue and now playing.",
    usage: "queue",
    async execute(message, args, client) {
        try {
            const player = client.player.players.get(message.guild.id);
            if (!player) return message.channel.send(handler.normalEmbed('There\'s no active player'));
            if (!player.queue.current) return message.channel.send(handler.normalEmbed('There\'s nothing playing'));
            try {
                let currentPage = 0;
                const embeds = this.build(message, player.queue);
                const queueEmbed = await message.channel.send(`${embeds[currentPage]}\n\nPage ${currentPage + 1}/${embeds.length} | Queue size: ${player.queue.size}`, { code: 'nim' });
                if (embeds.length <= 2) {
                    await queueEmbed.react("◀").catch(() => { });
                    await queueEmbed.react("🇽").catch(() => { });
                    await queueEmbed.react("▶").catch(() => { });
                } else {
                    await queueEmbed.react('⏪').catch(() => { });
                    await queueEmbed.react("◀").catch(() => { });
                    await queueEmbed.react("🇽").catch(() => { });
                    await queueEmbed.react("▶").catch(() => { });
                    await queueEmbed.react('⏩').catch(() => { });
                }

                const filter = (reaction, user) =>
                    ["⏪", "◀", "🇽", "▶", "⏩"].includes(reaction.emoji.name) && message.author.id === user.id;
                const collector = queueEmbed.createReactionCollector(filter, { time: 60000, dispose: true });

                collector.on("collect", async (reaction, user) => {
                    pagination(reaction, user)
                });
                collector.on("remove", async (reaction, user) => {
                    pagination(reaction, user)
                });

                function pagination(reaction, user) {
                    try {
                        if (reaction.emoji.name === "▶") {
                            if (currentPage < embeds.length - 1) {
                                currentPage++;
                                queueEmbed.edit(`${embeds[currentPage]}\n\nPage ${currentPage + 1}/${embeds.length} | Queue size: ${player.queue.size}`, { code: 'nim' });
                            }
                        } else if (reaction.emoji.name === "◀") {
                            if (currentPage !== 0) {
                                --currentPage;
                                queueEmbed.edit(`${embeds[currentPage]}\n\nPage ${currentPage + 1}/${embeds.length} | Queue size: ${player.queue.size}`, { code: 'nim' });
                            }
                        } else if (reaction.emoji.name === "⏩") {
                            if (currentPage < embeds.length - 1) {
                                currentPage = embeds.length - 1;
                                queueEmbed.edit(`${embeds[currentPage]}\n\nPage ${currentPage + 1}/${embeds.length} | Queue size: ${player.queue.size}`, { code: 'nim' });
                            }
                        } else if (reaction.emoji.name === "⏪") {
                            if (currentPage !== 0) {
                                currentPage = 0;
                                queueEmbed.edit(`${embeds[currentPage]}\n\nPage ${currentPage + 1}/${embeds.length} | Queue size: ${player.queue.size}`, { code: 'nim' });
                            }
                        } else {
                            collector.stop();
                            queueEmbed.delete()
                        }
                    } catch (err) {
                    }
                }
            } catch (err) {
            }
        } catch (err) {
            message.channel.send(`Oops, there's an error. ${err}`)
        }

    },
    build(message, queue) {
        try {
            const embeds = [];
            let k = 10;
            if (queue.length != 0) {
                for (let i = 0; i < queue.length; i += 10) {
                    const current = queue.slice(i, k);
                    let j = i;
                    k += 10;
                    const info = current.map((track) => {
                        let trackTitle = track.title.length >= 45 ? `${track.title.slice(0, 45)}...` : track.title
                        return `${++j} - ${trackTitle}${' '.repeat((48 - (trackTitle.length)))} ${track.isStream ? '◉ LIVE' : ((track.duration || !isNaN(track.duration)) ? new Date(parseInt(track.duration)).toISOString().slice(11, 19) : 'Unknown')}`
                    }).join("\n");
                    const text = (
                        `Current song: ${queue.current.title}\n\n` +
                        `${info ? info : 'Not detected'}\n`
                    )
                    embeds.push(text);
                }
            } else {
                const text = (
                    `Current song: ${queue.current.title}\n\n` +
                    `Add more song by using play command :D\n`
                )
                embeds.push(text);
            }
            return embeds;
        } catch (err) {
            message.client.logger.error(err)
            message.channel.send(`Oops, there's an error. ${err}`)
        }
    }
};

