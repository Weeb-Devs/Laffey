const {Manager} = require('erela.js');
const spotify = require('erela.js-spotify');
const deezer = require('erela.js-deezer');
const chalk = require('chalk');
const {Collection} = require('discord.js');
const {EmbedBuilder} = require('@discordjs/builders');

const {
    NODES,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
} = new (require('../modules/laffeyUtils'))();

class lavalink extends Manager {
    constructor(client) {
        super({
            nodes: collect(NODES),
            plugins: [new spotify({clientID: SPOTIFY_CLIENT_ID, clientSecret: SPOTIFY_CLIENT_SECRET}), new deezer()],
            autoPlay: true,
            shards: 0,
            send: (id, payload) => {
                const guild = client.guilds.cache.get(id)
                if (guild) return guild.shard.send(payload)
            }
        })
        client.rateLimit = new Collection();

        require('./player');
        this.on('nodeConnect', (node) => {
            console.log(chalk.green(`[LAVALINK] => [STATUS] ${node.options.identifier} successfully connected`))
        })

        this.once('nodeConnect', () => client.playerHandler.autoResume())

        this.on('nodeError', (node, error) => {
            console.log(chalk.red(`[LAVALINK] => [STATUS] ${node.options.identifier} encountered an error. Message: ${error.message ? error.message : 'No message'} | ${error.name} | ${error.stack}`))
        })

        this.on('nodeDisconnect', (node) => {
            console.log(chalk.redBright(`[LAVALINK] => [STATUS] ${node.options.identifier} disconnected`))
        })

        this.on('nodeReconnect', (node) => {
            console.log(chalk.yellowBright(`[LAVALINK] => [STATUS] ${node.options.identifier} is now reconnecting...`))
        })

        this.on('playerMove', ((player, oldChannel, newChannel) => {
            if (!newChannel) return player.destroy();
            player.set('moved', true)
            player.setVoiceChannel(newChannel)
            return client.playerHandler.savePlayer(player)
        }))

        this.on('socketClosed', (player, payload) => {
            if (player.get('moved')) return player.set('moved', false)
            if (payload.reason === 'Disconnected.' && payload.byRemote && payload.code === 4014) return player.destroy()
            if (!payload.byRemote) {
                setTimeout(() => {
                    if (player.playing) {
                        player.pause(true)
                        setTimeout(() => {
                            player.pause(false)
                        }, 300);
                    }
                }, 2000);
            } else {
                setTimeout(() => {
                    if (player.playing) {
                        player.pause(true)
                        setTimeout(() => {
                            player.pause(false)
                        }, 200);
                    }
                }, 700);
            }
        })

        this.on('playerDestroy', (player) => {
            if (player.get('message')) player.get('message').delete().catch(_ => void 0);
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(_ => void 0);
            }
            return client.playerHandler.delete(player.guild)
        })

        this.on('playerCreate', (player) => {
            player.set('rateLimitStatus', {status: false})
            player.set('24h', {status: false})
        })

        this.on('trackStart', (player, track) => {
            if (player.get('rateLimitStatus').status === true) return;
            const channel = client.channels.cache.get(player.textChannel);

            const playEmbed = new EmbedBuilder()
                .setAuthor({name: "Now Playing"})
                .setDescription(`${track ? `[${track.title}](${track.uri}) [${track.requester}]` : 'Unknown. Please skip or skipto to bring back current data'}`)
                .setColor(0x00C7FF)
            channel.send({embeds: [playEmbed]}).then(msg => player.set('message', msg))
            return client.playerHandler.savePlayer(player)
        })
        this.on('trackEnd', (player) => {
            if (player.get('rateLimitStatus').status === true) return;
            if (player.get('message')) player.get('message').delete().catch(_ => void 0);

            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(_ => void 0);
            }
        })
        this.on('trackStuck', (player, track, payload) => {
            if (player.get('stuck')) player.get('stuck').delete().catch(_ => void 0);

            const channel = client.channels.cache.get(player.textChannel);
            const playEmbed = new EmbedBuilder()
                .setAuthor({name: "Stuck"})
                .setDescription(`There was an error while playing **${track.title}** \n\`\`\`${payload.type}\`\`\``)
                .setColor(0x00C7FF)
            channel.send({embeds: [playEmbed]}).then(msg => player.set('stuck', msg))
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(_ => void 0);
            }
        })
        this.on('trackError', (player, track, payload) => {
            const rate = client.rateLimit.get(player.guild)
            const time1 = new Date()
            const time2 = new Date()
            if (rate && (time2 - rate.time <= 500) && player.get('rateLimitStatus').status === false) {
                const channel = client.channels.cache.get(player.textChannel);

                const errorEmbed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setDescription(`Got a lot of errors within a short time. Now playing embed will be stopped for 40s to prevent spamming.`)
                    .setColor(0x00C7FF)
                player.set('rateLimitStatus', {status: true})
                setTimeout(_ => player.set('rateLimitStatus', {status: false}), 40000);
                channel.send({embeds: [errorEmbed]}).then(msg => player.set('rateLimitMsg', msg)).catch(_ => void 0);
            } else if (player.get('rateLimitStatus').status === true) return;
            else {
                if (player.get('error')) player.get('error').delete().catch(_ => void 0);
                if (player.get('rateLimitMsg')) player.get('rateLimitMsg').delete().catch(_ => void 0);

                const channel = client.channels.cache.get(player.textChannel);
                const err = payload.exception ? `Severity: ${payload.exception.severity}\nMessage: ${payload.exception.message}\nCause: ${payload.exception.cause}` : ''

                const errorEmbed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setDescription(`There was an error while playing **${track.title}** \n\`\`\`${err ? err : 'No error was provided from host'}\`\`\``)
                    .setColor(0x00C7FF)
                channel.send({embeds: [errorEmbed]}).then(msg => player.set('error', msg)).catch(_ => void 0);
                if (player.get('nowplaying')) {
                    clearInterval(player.get('nowplaying'));
                    player.get('nowplayingMSG').delete().catch(_ => void 0);
                }
            }
            client.rateLimit.delete(player.guild)
            client.rateLimit.set(player.guild, {time: time1})
        })
        this.on('queueEnd', (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            const noQueueEmbed = new EmbedBuilder()
                .setAuthor({name: "End"})
                .setDescription(`There's no queue left. Add more by using play command!`)
                .setColor(0x00C7FF)
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(_ => void 0);
            }
            channel.send({embeds: [noQueueEmbed]}).catch(_ => void 0);
            setTimeout(() => {
                const e = client.player.players.get(player.guild)
                if (e && !e.queue.current) {
                    e.destroy()
                    const leftEmbed = new EmbedBuilder()
                        .setAuthor({name: "End"})
                        .setDescription(`Leaving due to inactivity`)
                        .setColor(0x00C7FF)
                    channel.send({embed: leftEmbed}).catch(_ => void 0);
                }
            }, 60 * 1000);
        })
    }
}

function collect(node) {
    return node.map(x => {
        if (!x.HOST) throw new RangeError('Host must be provided')
        if (typeof x.PORT !== 'number') throw new RangeError('Port must be a number')
        if (typeof x.RETRY_AMOUNT !== 'number') throw new RangeError('Retry amount must be a number')
        if (typeof x.RETRY_DELAY !== 'number') throw new RangeError('Retry delay must be a number')
        if (typeof x.SECURE !== 'boolean') throw new RangeError('Secure must be a boolean')
        return {
            host: x.HOST,
            password: x.PASSWORD ? x.PASSWORD : 'youshallnotpass',
            port: x.PORT || 8080,
            identifier: x.IDENTIFIER || x.HOST,
            retryAmount: x.RETRY_AMOUNT,
            retryDelay: x.RETRY_DELAY,
            secure: x.SECURE
        };
    });
}


module.exports = lavalink;