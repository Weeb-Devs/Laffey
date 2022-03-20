const {Client, Collection} = require('discord.js');
const {TOKEN, MONGODB_URI, OWNERS, LYRICS_ENGINE} = new (require('./modules/laffeyUtils'))();
const eventHandler = require('./modules/eventHandler');
const playerHandler = require('./modules/playerHandler');
const lyricsHandler = require('./modules/lyricsHandler');
const chalk = require('chalk');
const commandHandler = require('./handlers/command.js');
const loggerHandler = require('./handlers/logger.js');
const mongoose = require('mongoose');
const ClientOptions = require("./ClientOptions");


class Laffey extends Client {
    constructor() {
        super(ClientOptions);

        this.loginMongo().then(async x => {
            this.database = !!x;
            if (!x) {
                this.logger.error('MONGODB URI is either not provided or invalid. Extra feature (prefix) won\'t be available')
            } else {
                this.logger.log('DATABASE', 'Connected to database')
                await new Promise(r => setTimeout(r, 1000));
            }
        })

        // Start making base data on client //
        this.commands = new Collection();
        this.voiceTimeout = new Collection();
        this.logger = new loggerHandler();
        this.playerHandler = new playerHandler(this);
        this.lyrics = new lyricsHandler(this, LYRICS_ENGINE);
        this.owners = OWNERS;

        // Collect needed data to client //
        new eventHandler(this).start();
        commandHandler.bind(this)();
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
