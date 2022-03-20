const {TrackUtils} = require('erela.js');
const autoResume = require('../schemas/autoResume');
const chalk = require("chalk");
const {AUTO_RESUME_DELAY} = new (require('../modules/laffeyUtils'))();
const { generate } = require('shortid');

module.exports = class LaffeyPlayerHandler {
    constructor(client) {
        this.client = client;
        // console.log(this.client)
    }

    async autoResume() {
        if (this.client.database === undefined) return setTimeout(() => this.autoResume(), 1000)
        if (!this.client.database) return;
        console.log(chalk.yellow(`[LAVALINK] => [AUTO RESUME] Collecting player data`))
        const queues = await autoResume.find()
        console.log(chalk.greenBright(`[LAVALINK] => [AUTO RESUME] found ${queues.length ? `${queues.length} queue${queues.length > 1 ? 's' : ''}. Resuming all queue` : '0 queue'}`))
        if (!queues.length) return;
        for (let data of queues) {
            const index = queues.indexOf(data);
            setTimeout(async () => {
                const channel = this.client.channels.cache.get(data.textChannel)
                const voice = this.client.channels.cache.get(data.voiceChannel)
                if (this.client.player.players.get(data.guildID) || !channel || !voice) return this.delete(null, data.playerID)

                const player = this.client.player.create({
                    guild: data.guildID,
                    voiceChannel: data.voiceChannel,
                    textChannel: data.textChannel,
                    selfDeafen: true
                })
                player.connect()
                if (data.currentSong && data.currentSong.identifier) {
                    const track = await this.buildTrack(data.currentSong);
                    player.queue.add(track)
                    player.play()
                    if (data.queue.length && data.queue[0]) for (let track of data.queue) player.queue.add(await this.buildTrack(track))
                } else if (data.queue.length && data.queue[0]) {
                    const track = await this.buildTrack(data.queue.shift());
                    player.queue.add(track)
                    player.play()
                    if (data.queue.length && data.queue[0]) for (let track of data.queue) player.queue.add(await this.buildTrack(track))
                } else player.destroy()

                player.set('24h', {status: data._24h})

                // Handle filters here
                if (data.bassboost !== 'false') setTimeout(() => player.setBassboost(Number(data.bassboost)), 2000);
                else if (data.nightcore) setTimeout(() => player.setNightcore(true), 2000);
                else if (data.vaporwave) setTimeout(() => player.setVaporwave(true), 2000);
                else if (data._8d) setTimeout(() => player.set8D(true), 2000);

                // Handle speed and pitch here
                if (data.speed !== 1) setTimeout(() => player.setSpeed(data.speed), 1000);
                else if (data.pitch !== 1) setTimeout(() => player.setPitch(data.pitch), 1000);

                if (data.loopQueue) player.setQueueRepeat(true)
                else if (data.loopSong) player.setTrackRepeat(true)

            }, index * AUTO_RESUME_DELAY)
        }
        return true
    }

    async buildTrack(data) {
        return data.track && data.identifier ? TrackUtils.build({
                track: data.track,
                info: {
                    title: data.title || null,
                    identifier: data.identifier,
                    author: data.author || null,
                    length: data.duration || null,
                    isSeekable: !!data.isStream,
                    isStream: !!data.isStream,
                    uri: data.uri || null,
                    thumbnail: data.thumbnail || null,
                }
            }, data.requester ? await this.client.users.fetch(data.requester) : null)
            :
            TrackUtils.buildUnresolved({
                title: data.title || '',
                author: data.author || '',
                duration: data.duration || 0
            }, data.requester ? await this.client.users.fetch(data.requester) : null)
    }

    async savePlayer(player) {
        if (!this.client.database) return;
        if (!player || typeof player.guild !== 'string') throw new RangeError('Invalid player');
        let guildID = player.guild
        const data = await autoResume.findOne({guildID: guildID})

        if (!data) {
            const newData = new autoResume(this.buildStructure(player))
            return await newData.save()
        }
        return autoResume.findOneAndUpdate({guildID}, this.buildStructure(player));
    }

    buildStructure(player) {
        return {
            guildID: player.guild,
            voiceChannel: player.voiceChannel,
            textChannel: player.textChannel,
            queue: player.queue,
            currentSong: player.queue.current,
            bassboost: player.bassboost,
            volume: player.volume,
            loopQueue: player.queueRepeat,
            loopSong: player.trackRepeat,
            nightcore: player.nightcore,
            vaporwave: player.vaporwave,
            speed: player.speed,
            pitch: player.pitch,
            _8d: player._8d,
            _24h: player.get('24h').status,
            playerID: generate()
        }
    }

    async delete(guildID, id) {
        if (!this.client.database) return;
        return id ? await autoResume.findOneAndRemove({playerID: id}) : await autoResume.findOneAndRemove({guildID});
    }
}