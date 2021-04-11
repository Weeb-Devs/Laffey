const prefix = require('../schemas/prefix');

async function get(guildId) {
    const data = await prefix.findOne({
        guildID: guildId
    })

    if (data) {
        return { msg: 'success', error: false, prefix: data.prefix }
    } else {
        return { msg: 'error', error: true, prefix: null }
    }
}

async function set(client, guildId, Prefix) {
    const data = await prefix.findOne({
        guildID: guildId
    })

    if (data) {
        await prefix.findOneAndUpdate({
            guildID: guildId
        }, {
            guildID: guildId,
            prefix: Prefix
        })
        client.prefixes.set(guildId, { prefix: Prefix, guildID: guildId })
        return { msg: 'success', error: false, prefix: Prefix }
    } else {
        const newPrefix = new prefix({
            guildID: guildId,
            prefix: Prefix
        })
        newPrefix.save()
        client.prefixes.set(guildId, { prefix: Prefix, guildID: guildId })
        return { msg: 'success', error: false, prefix: Prefix }
    }
}

async function reset(client, guildId) {
    const data = await prefix.findOne({
        guildID: guildId
    })

    if (data) {
        client.prefixes.delete(guildId)
        return { msg: 'success', error: false }
    } else {
        client.prefixes.delete(guildId)
        return { msg: 'error', error: true }
    }
}

module.exports = { get, set, reset }