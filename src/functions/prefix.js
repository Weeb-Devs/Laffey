const prefix = require('../schemas/prefix');

async function get(guildID) {
    const data = await prefix.findOne({ guildID })

    if (data)
        return { msg: 'success', error: false, prefix: data.prefix }
    return { msg: 'error', error: true, prefix: null }
}

async function set(client, guildID, Prefix) {
    const data = await prefix.findOne({ guildID })

    if (data) {
        await prefix.findOneAndUpdate({ guildID }, { guildID, prefix: Prefix })
        client.prefixes.set(guildID, { prefix: Prefix, guildID })
        return { msg: 'success', error: false, Prefix }
    } else {
        const newPrefix = new prefix({ guildID, prefix: Prefix })
        newPrefix.save()
        client.prefixes.set(guildID, { prefix: Prefix, guildID })
        return { msg: 'success', error: false, Prefix }
    }
}

async function reset(client, guildID) {
    const data = await prefix.findOne({ guildID })
    client.prefixes.delete(guildID)
    
    if (data)
        return { msg: 'success', error: false };
    return { msg: 'error', error: true };
}

module.exports = { get, set, reset }
