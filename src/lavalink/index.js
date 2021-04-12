const { Manager } = require('erela.js');
const spotify = require('erela.js-spotify');
const deezer = require('erela.js-deezer');
const chalk = require('chalk');
const { MessageEmbed } = require('discord.js');
const {
    NODES,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
} = require('../../config.json');

class lavalink extends Manager {
    constructor(client) {
        super({
            nodes: collect(NODES),
            plugins: [new spotify({ clientID: SPOTIFY_CLIENT_ID, clientSecret: SPOTIFY_CLIENT_SECRET }), new deezer()],
            autoPlay: true,
            shards: 0,
            send: (id, payload) => {
                const guild = client.guilds.cache.get(id)
                if (guild) guild.shard.send(payload)
            }
        })
        require('./player');
        this.on('nodeConnect', (node) => {
            console.log(chalk.green(`[LAVALINK] => [STATUS] ${node.options.identifier} successfully connected`))
        })
        this.on('playerMove', (player, oldC, newC) => {
            player.setVoiceChannel(newC)
        })
        this.on('nodeError', (node, error) => {
            console.log(chalk.red(`[LAVALINK] => [STATUS] ${node.options.identifier} encounted error. Message: ${error.message ? error.message : 'No message'} | ${error.name} | ${error.stack}`))
        })
        this.on('nodeDisconnect', (node) => {
            console.log(chalk.redBright(`[LAVALINK] => [STATUS] ${node.options.identifier} disconnected`))
        })
        this.on('nodeReconnect', (node) => {
            console.log(chalk.yellowBright(`[LAVALINK] => [STATUS] ${node.options.identifier} is now reconnecting...`))
        })
        this.on('socketClosed', (player, payload) => {
            if (payload.reason == 'Disconnected.' && payload.byRemote && payload.code == 4014) return player.destroy()
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
            if (player.get('message') && !player.get('message').deleted) player.get('message').delete().catch(() => { });
            if (player.get('nowplaying')) { clearInterval(player.get('nowplaying')); player.get('nowplayingMSG').delete().catch(() => { }) }
        })
        this.on('trackStart', (player, track) => {
            const channel = client.channels.cache.get(player.textChannel);
            const guild = client.guilds.cache.get(player.guild)
            var playembed = new MessageEmbed()
                .setAuthor("Now Playing")
                .setDescription(`${track ? `[${track.title}](${track.uri}) [${track.requester}]` : 'Unknown. Please skip or skipto to bring back current data'}`)
                .setColor(guild.me.displayHexColor != '#000000' ? guild.me.displayHexColor : '#00C7FF')
            channel.send(playembed).then(msg => player.set('message', msg))
        })
        this.on('trackEnd', (player, track) => {
            if (player.get('message') && !player.get('message').deleted) player.get('message').delete().catch(() => { });
            if (player.get('nowplaying')) { clearInterval(player.get('nowplaying')); player.get('nowplayingMSG').delete().catch(() => { }) }
        })
        this.on('trackStuck', (player, track, payload) => {
            if (player.get('stuck') && !player.get('stuck').deleted) player.get('stuck').delete().catch(() => { });
            const channel = client.channels.cache.get(player.textChannel);
            const guild = client.guilds.cache.get(player.guild)
            var playembed = new MessageEmbed()
                .setAuthor("Stuck")
                .setDescription(`There was an error while playing **${track.title}** \n\`\`\`${payload.type}\`\`\``)
                .setColor(guild.me.displayHexColor != '#000000' ? guild.me.displayHexColor : '#00C7FF')
            channel.send(playembed).then(msg => player.set('stuck', msg))
            if (player.get('nowplaying')) { clearInterval(player.get('nowplaying')); player.get('nowplayingMSG').delete().catch(() => { }) }
        })
        this.on('trackError', (player, track, payload) => {
            if (player.get('error') && !player.get('error').deleted) player.get('error').delete().catch(() => { });
            const channel = client.channels.cache.get(player.textChannel);
            const guild = client.guilds.cache.get(player.guild)
            var playembed = new MessageEmbed()
                .setAuthor("Error")
                .setDescription(`There was an error while playing **${track.title}** \n\`\`\`${payload.exception ? `Severity: ${payload.exception.severity}\nMessage: ${payload.exception.message}\nCause: ${payload.exception.cause}` : ''}\`\`\``)
                .setColor(guild.me.displayHexColor != '#000000' ? guild.me.displayHexColor : '#00C7FF')
            channel.send(playembed).then(msg => player.set('error', msg))
            if (player.get('nowplaying')) { clearInterval(player.get('nowplaying')); player.get('nowplayingMSG').delete().catch(() => { }) }
        })
        this.on('queueEnd', (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            const guild = client.guilds.cache.get(player.guild)
            var endEmbed = new MessageEmbed()
                .setAuthor("End")
                .setDescription(`There's no queue left. Add more by using play command!`)
                .setColor(guild.me.displayHexColor != '#000000' ? guild.me.displayHexColor : '#00C7FF')
            if (player.get('nowplaying')) { clearInterval(player.get('nowplaying')); player.get('nowplayingMSG').delete().catch(() => { }) }
            setTimeout(() => {
                const e = client.player.players.get(player.guild)
                if (e && !e.queue.current) {
                    e.destroy()
                    var leftEmbed = new MessageEmbed()
                        .setAuthor("End")
                        .setDescription(`Leaving due to inactivity`)
                        .setColor(guild.me.displayHexColor != '#000000' ? guild.me.displayHexColor : '#00C7FF')
                    channel.send(leftEmbed).catch((_) => { })
                }
            }, 60000);
            channel.send(endEmbed).catch((_) => { })
        })
    }
}

function collect(node) {
    let nodes = []
    node.forEach(x => {
        if (!x.HOST) throw new RangeError('Host must be provided')
        if (typeof x.PORT != 'number') throw new RangeError('Port must be a number')
        if (typeof x.RETRY_AMOUNT != 'number') throw new RangeError('Retry amount must be a number')
        if (typeof x.RETRY_DELAY != 'number') throw new RangeError('Retry delay must be a number')
        if (typeof x.SECURE != 'boolean') throw new RangeError('Secure must be a boolean')
        nodes.push({
            host: x.HOST,
            password: x.PASSWORD ? x.PASSWORD : 'youshallnotpass',
            port: x.PORT ? x.PORT : 8080,
            identifier: x.IDENTIFIER ? x.IDENTIFIER : x.HOST,
            retryAmount: x.RETRY_AMOUNT,
            retryDelay: x.RETRY_DELAY,
            secure: x.SECURE
        })
    })
    return nodes;
}


module.exports = lavalink;