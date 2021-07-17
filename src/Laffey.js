const {Client, Util, Collection} = require('discord.js');
const utils = require('./modules/laffeyUtils');
const { TOKEN, PREFIX, MONGODB_URI, OWNERS } = new (require('./modules/laffeyUtils'))();
const eventHandler = require('./modules/eventHandler');
const playerHandler = require('./modules/playerHandler');
const chalk = require('chalk');
const commandHandler = require('./handlers/command.js');
const loggerHandler = require('./handlers/logger.js');
const mongoose = require('mongoose');
const cache = require('./cache/manager');


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
        this.voiceTimeout = new Collection();
        this.logger = new loggerHandler();
        this.playerHandler = new playerHandler(this);
        this.owners = OWNERS;
        this.defaultPrefix = PREFIX;

        // Collect needed data to client //
        new eventHandler(this).start();
        commandHandler(this)
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
        if (!TOKEN) throw new RangeError('You must include TOKEN to login either in config.json or env')
        await super.login(TOKEN)
            .then(x => {
                return x
            })
            .catch(err => console.log(chalk.red(err)))
    }
}

module.exports = Laffey;