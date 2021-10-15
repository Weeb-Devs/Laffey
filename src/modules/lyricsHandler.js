const {KSOFT_API_KEY, GENIUS_API_KEY} = new (require('./laffeyUtils'))();
const {KSoftClient} = require('@ksoft/api');
const {Client} = require('genius-lyrics');
const lyricsFinder = require('lyrics-finder');

module.exports = class laffeyLyrics {
    constructor(client, mode) {
        if (!mode || typeof mode !== 'string' || !['ksoft', 'genius', 'google'].includes(mode)) throw new Error("Invalid lyrics mode type. Received " + mode);
        this.mode = mode;
        this.client = client;
        this.client.logger.debug("LYRICS", `Now using ${mode} for the lyrics engine.`)
        this.clients = {
            ksoft: null,
            genius: null,
            google: null
        }
        this.validateToken();
    }

    async search(title) {
        const x = await this[this.mode](title);
        
        switch (this.mode) {
            case "ksoft": {
                return {...x, source: "KSoft.Si"};
            }

            case "genius": {
                return {...x, source: "Genius"};
            }
            case "google": {
                return {...x, source: "Google"};
            }
        }
    }

    validateToken() {
        switch (this.mode) {
            case "ksoft": {
                if (!KSOFT_API_KEY) throw new Error("KSOFT_API_KEY is not provided. Please add either in .env or config.json");
                this.clients.ksoft = new KSoftClient(KSOFT_API_KEY);
                break;
            }

            case "genius": {
                if (!GENIUS_API_KEY) throw new Error("GENIUS_API_KEY is not provided. Please add either in .env or config.json");
                this.clients.genius = new Client(GENIUS_API_KEY).songs;
                break;
            }

            case "google": {
                this.clients.google = lyricsFinder;
            }
        }
    }

    ksoft(title) {
        if (!title) throw new Error("No title was provided")
        if (!this.clients.ksoft) throw new Error("KSOFT client is either disabled or not ready.")
        return new Promise(async (resolve, reject) => {
            this.clients.ksoft.lyrics.get(title).then(x => {
                if (!x.lyrics) return reject("No lyrics was found")
                resolve({
                    lyrics: x.lyrics,
                    artist: x.artist?.name || '',
                    title: x.name,
                    artwork: x.artwork || null
                })
            }).catch(reject)
        })
    }

    genius(title) {
        if (!title) throw new Error("No title was provided")
        if (!this.clients.genius) throw new Error("GENIUS client is either disabled or not ready.")
        return new Promise(async (resolve, reject) => {
            try {
                this.clients.genius.search(title).then(async x => {
                    const firstSong = x[0];
                    if (!x.length || !firstSong) return reject("No lyrics was found")
                    const lyrics = await firstSong.lyrics().catch(reject);
                    resolve({
                        lyrics,
                        artist: x.artist?.name || '',
                        title: x.title,
                        artwork: x.image || null
                    })
                }).catch(reject)
            } catch (e) {
                reject(e)
            }
        })
    }

    google(title) {
        if (!title) throw new Error("No title was provided")
        if (!this.clients.google) throw new Error("GOOGLE client is either disabled or not ready.");
        return new Promise((resolve, reject) => {
            this.clients.google(title, "").then(x => {
                if (!x) return reject("No lyrics was found")
                resolve({
                    lyrics: x,
                    artist: '',
                    title,
                    artwork: null
                })
            }).catch(reject)
        })
    }
}
