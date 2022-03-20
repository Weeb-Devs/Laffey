const config = require('../../config.json');

module.exports = class laffeyUtils {
    get TOKEN() {
        return process.env.TOKEN || config.TOKEN
    }

    get PREFIX() {
        return process.env.PREFIX || config.PREFIX
    }

    get OWNERS() {
        return process.env.OWNERS ? process.env.OWNERS.split(',').length ? process.env.OWNERS.split(',') : config.OWNERS : config.OWNERS
    }

    get MONGODB_URI() {
        return process.env.MONGODB_URI || config.MONGODB_URI
    }

    get KSOFT_API_KEY() {
        return process.env.KSOFT_API_KEY || config.KSOFT_API_KEY
    }

    get GENIUS_API_KEY() {
        return process.env.GENIUS_API_KEY || config.GENIUS_API_KEY
    }

    get LYRICS_ENGINE() {
        return process.env.LYRICS_ENGINE || config.LYRICS_ENGINE
    }

    get NODES() {
        return process.env.NODES ? JSON.parse(process.env.NODES) : config.NODES
    }

    get AUTO_RESUME_DELAY() {
        return process.env.AUTO_RESUME_DELAY || config.AUTO_RESUME_DELAY
    }

    get DEBUG() {
        return process.env.DEBUG || config.DEBUG
    }

    get LOG_USAGE() {
        return process.env.LOG_USAGE || config.LOG_USAGE
    }
}
