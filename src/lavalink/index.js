const {Manager} = require('erela.js');
const spotify = require('erela.js-spotify');
const deezer = require('erela.js-deezer');
const chalk = require('chalk');
const {MessageEmbed, Collection} = require('discord.js');
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
        this.on('playerMove', (player, oldC, newC) => {
            player.setVoiceChannel(newC)
        })
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
            if (player.get('message') && !player.get('message').deleted) player.get('message').delete().catch(() => {
            });
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(() => {
                })
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
            const guild = client.guilds.cache.get(player.guild)
            const playEmbed = new MessageEmbed()
                .setAuthor("Now Playing")
                .setDescription(`${track ? `[${track.title}](${track.uri}) [${track.requester}]` : 'Unknown. Please skip or skipto to bring back current data'}`)
                .setColor(guild.me.displayHexColor !== '#000000' ? guild.me.displayHexColor : '#00C7FF')
            channel.send({embed: playEmbed}).then(msg => player.set('message', msg))
            return client.playerHandler.savePlayer(player)
        })
        this.on('trackEnd', (player) => {
            if (player.get('rateLimitStatus').status === true) return;
            if (player.get('message') && !player.get('message').deleted) player.get('message').delete().catch(() => {
            });
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(() => {
                })
            }
        })
        this.on('trackStuck', (player, track, payload) => {
            if (player.get('stuck') && !player.get('stuck').deleted) player.get('stuck').delete().catch(() => {
            });
            const channel = client.channels.cache.get(player.textChannel);
            const guild = client.guilds.cache.get(player.guild)
            const playEmbed = new MessageEmbed()
                .setAuthor("Stuck")
                .setDescription(`There was an error while playing **${track.title}** \n\`\`\`${payload.type}\`\`\``)
                .setColor(guild.me.displayHexColor !== '#000000' ? guild.me.displayHexColor : '#00C7FF')
            channel.send({embed: playEmbed}).then(msg => player.set('stuck', msg))
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(() => {
                })
            }
        })
        this.on('trackError', (player, track, payload) => {
            const rate = client.rateLimit.get(player.guild)
            const time1 = new Date()
            const time2 = new Date()
            if (rate && (time2 - rate.time <= 500) && player.get('rateLimitStatus').status === false) {
                const channel = client.channels.cache.get(player.textChannel);
                const guild = client.guilds.cache.get(player.guild)
                const errorEmbed = new MessageEmbed()
                    .setAuthor("Error")
                    .setDescription(`Got a lot of errors within a short time. Now playing embed will be stopped for 40s to prevent spamming.`)
                    .setColor(guild.me.displayHexColor !== '#000000' ? guild.me.displayHexColor : '#00C7FF')
                player.set('rateLimitStatus', {status: true})
                setTimeout(() => {
                    player.set('rateLimitStatus', {status: false})
                }, 40000);
                channel.send({embed: errorEmbed}).then(msg => player.set('rateLimitMsg', msg))
            } else if (player.get('rateLimitStatus').status === true) {
                return
            } else {
                if (player.get('error') && !player.get('error').deleted) player.get('error').delete().catch(() => {
                });
                if (player.get('rateLimitMsg') && !player.get('rateLimitMsg').deleted) player.get('rateLimitMsg').delete().catch(() => {
                });
                const channel = client.channels.cache.get(player.textChannel);
                const guild = client.guilds.cache.get(player.guild)
                const err = payload.exception ? `Severity: ${payload.exception.severity}\nMessage: ${payload.exception.message}\nCause: ${payload.exception.cause}` : ''
                const errorEmbed = new MessageEmbed()
                    .setAuthor("Error")
                    .setDescription(`There was an error while playing **${track.title}** \n\`\`\`${err ? err : 'No error was provided from host'}\`\`\``)
                    .setColor(guild.me.displayHexColor !== '#000000' ? guild.me.displayHexColor : '#00C7FF')
                channel.send({embed: errorEmbed}).then(msg => player.set('error', msg))
                if (player.get('nowplaying')) {
                    clearInterval(player.get('nowplaying'));
                    player.get('nowplayingMSG').delete().catch(() => {
                    })
                }
            }
            client.rateLimit.delete(player.guild)
            client.rateLimit.set(player.guild, {time: time1})
        })
        this.on('queueEnd', (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            const guild = client.guilds.cache.get(player.guild)
            const noQueueEmbed = new MessageEmbed()
                .setAuthor("End")
                .setDescription(`There's no queue left. Add more by using play command!`)
                .setColor(guild.me.displayHexColor !== '#000000' ? guild.me.displayHexColor : '#00C7FF')
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG').delete().catch(() => {
                })
            }
            channel.send({embed: noQueueEmbed}).catch(() => {
            })
            setTimeout(() => {
                const e = client.player.players.get(player.guild)
                if (e && !e.queue.current) {
                    e.destroy()
                    const leftEmbed = new MessageEmbed()
                        .setAuthor("End")
                        .setDescription(`Leaving due to inactivity`)
                        .setColor(guild.me.displayHexColor !== '#000000' ? guild.me.displayHexColor : '#00C7FF')
                    channel.send({embed: leftEmbed}).catch(() => {
                    })
                }
            }, 60000);
        })
    }
}

function collect(node) {
    return node.map(x => {
        if (!x.HOST) throw new RangeError('Host must be provided')
        if (typeof x.PORT != 'number') throw new RangeError('Port must be a number')
        if (typeof x.RETRY_AMOUNT != 'number') throw new RangeError('Retry amount must be a number')
        if (typeof x.RETRY_DELAY != 'number') throw new RangeError('Retry delay must be a number')
        if (typeof x.SECURE != 'boolean') throw new RangeError('Secure must be a boolean')
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