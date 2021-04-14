const { Client, MessageEmbed, Util, Collection } = require('discord.js');
const { TOKEN, PREFIX, MONGODB_URI, OWNERS, LOG_USAGE } = require('../config.json');
const chalk = require('chalk');
const commandHandler = require('./handlers/command.ts');
const loggerHandler = require('./handlers/logger.ts');
const mongoose = require('mongoose');
const cache = require('./cache/manager');
const lavalink = require('./lavalink/index');


class Laffey extends Client {
    constructor() {
        super({
            disableMentions: 'everyone',
            messageCacheMaxSize: 200,
            ws: {
                properties: {
                    $browser: 'iOS'
                }
            },
            restTimeOffset: 0
        })
        this.loginMongo().then(async x => {
            if (!x) {
                this.database = false;
                this.logger.error('MONGODB URI is either not provided or invalid. Extra feature (prefix) won\'t be available')
            } else {
                this.database = true;
                this.logger.log('DATABASE', 'Connected to database')
                await Util.delayFor(1000)
                cache(this)
            }
        })

        // Start making base data on client //
        this.prefixes = new Map();
        this.commands = new Collection();
        this.logger = new loggerHandler();
        this.owners = OWNERS;
        this.defaultPrefix = PREFIX;

        // Collect needed data to client //
        commandHandler(this)


        // Events start here //

        this.on('ready', async () => {
            this.player = new lavalink(this)
            this.player.init(this.user.id)
            this.user.setActivity(`${PREFIX}help | Currently in ${this.guilds.cache.size} guild${this.guilds.cache.size <= 1 ? '' : 's'} | 0.1.3`)
            setInterval(() => {
                let statusList = [
                    `${PREFIX}help | ${this.guilds.cache.size}guild${this.guilds.cache.size <= 1 ? '' : 's'} | 0.1.3`,
                    `${PREFIX}help | ${this.users.cache.size}user${this.users.cache.size <= 1 ? '' : 's'} | 0.1.3`,
                    `${PREFIX}help | ${this.player?.players.size}player${this.player?.players.size <= 1 ? '' : 's'} | 0.1.3`,
                ]
                let choosenStatus = statusList[Math.round(Math.random() * statusList.length)]
                this.user.setActivity(choosenStatus, { type: 3 })
            }, 40 * 1000);
            console.log(chalk.green(`[CLIENT] => [READY] ${this.user.tag} is now ready!`))
            await Util.delayFor(800)
            this.on('raw', (d) => this.player.updateVoiceState(d))
        })

        this.on('voiceStateUpdate', (oldC, newC) => {
            if (oldC.id == this.user.id) return;
            if (this.player.players.get(newC.guild.id) && oldC.channelID && !newC.channelID) {
                if (this.channels.cache.get(this.player.players.get(newC.guild.id).voiceChannel).members.filter(x => !x.user.bot).size == 0) {
                    setTimeout(() => {
                        if (this.player.players.get(newC.guild.id) && this.channels.cache.get(this.player.players.get(newC.guild.id).voiceChannel).members.filter(x => !x.user.bot).size == 0) {
                            const leftEmbed = new MessageEmbed()
                                .setDescription('Destroying player and leaving voice channel due to inactivity')
                                .setColor(this.guilds.cache.get(newC.guild.id).me.displayHexColor != '#000000' ? this.guilds.cache.get(newC.guild.id).me.displayHexColor : '#00C7FF')
                            this.channels.cache.get(this.player.players.get(newC.guild.id).textChannel)?.send(leftEmbed)
                            this.player.players.get(newC.guild.id).destroy()
                        }
                    }, 120000);
                }
            }
        })

        this.on('guildCreate', (guild) => {
            this.logger.debug('GUILD', `${guild.name} joined with ${guild.memberCount} users`)
        })

        this.on('guildDelete', (guild) => {
            this.logger.debug('GUILD', `${guild.name} left`)
        })

        this.on('message', async (message) => {
            if (!message.guild) return;
            if (message.author.bot) return;
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            let command, args, prefix;
            let intro = new MessageEmbed()
                .setAuthor('Laffey', 'https://i.imgur.com/oAmrqHD.png')
                .setDescription(`My prefix in \`${message.guild.name}\` is ${this.prefixes.get(message.guild.id) ? this.prefixes.get(message.guild.id).prefix : PREFIX}`)
                .setColor('#f50ae5')
            if (message.content == `<@!${this.user.id}>` || message.content == `<@${this.user.id}>`) {
                if (!message.guild.me.permissions.has('SEND_MESSAGES')) return message.author.send('Hey, i need `SEND_MESSAGES` permission to do interaction with user.').catch((_) => { })
                return message.channel.send(intro)
            }

            if (!message.content) return;

            if (this.prefixes.get(message.guild.id)?.prefix) {
                prefix = this.prefixes.get(message.guild.id).prefix
                const prefixRegex = new RegExp(`^(<@!?${this.user.id}>|${escapeRegex(prefix)})\\s*`);
                if (!prefixRegex.test(message.content)) return;
                const [, matchedPrefix] = message.content.match(prefixRegex);

                args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                command = this.commands.get(commandName) || this.commands.find(x => x.aliases && x.aliases.includes(commandName));

            } else {
                prefix = PREFIX
                const prefixRegex = new RegExp(`^(<@!?${this.user.id}>|${escapeRegex(prefix)})\\s*`);
                if (!prefixRegex.test(message.content)) return;
                const [, matchedPrefix] = message.content.match(prefixRegex);

                args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                command = this.commands.get(commandName) || this.commands.find(x => x.aliases && x.aliases.includes(commandName));
            }
            if (!command) return;
            if (!message.guild.me.permissions.has('SEND_MESSAGES')) return message.author.send('Hey, i need `SEND_MESSAGES` permission to do interaction with user.').catch((_) => { })

            try {
                if (LOG_USAGE) {
                    console.log(chalk.magenta(`[LOG] => [COMMANDS] ${message.author.tag} (${message.author.id}) : ${message.content}`))
                }
                await command.execute(message, args, this)
            } catch (err) {
                const errorEmbed = new MessageEmbed()
                    .setDescription(`I'm sorry, there was an error while executing **${command.name}**\n\`\`\`${err}\`\`\``)
                    .setColor(this.guilds.cache.get(message.guild.id).me.displayHexColor != '#000000' ? this.guilds.cache.get(message.guild.id).me.displayHexColor : '#00C7FF')
                message.channel.send(errorEmbed)
                this.logger.error(err)
            }
        })
    }

    async loginMongo() {
        let available = false
        if (!MONGODB_URI) return available;

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            useFindAndModify: true
        }).then(() => {
            available = true
        }).catch(() => {
            available = false
        })
        return available
    }

    async login() {
        if (!TOKEN) throw new RangeError('You must include TOKEN to login in config.json')
        await super.login(TOKEN)
            .then(x => { return x })
            .catch(err => console.log(chalk.red(err)))
    }
}

module.exports = Laffey;