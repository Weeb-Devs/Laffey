const prefix = require('./prefix');

function main(client) {
    client.logger.debug('PREFIX', 'Caching prefixes')

    new prefix(this).cache().then((data) => {
        for (const element of data)
            client.prefixes.set(element.guildID, { prefix: element.prefix, guildID: element.guildID });
        client.logger.debug('PREFIX', 'Cached prefix')
    }).catch((_) => client.logger.debug('PREFIX', 'No prefix was saved'))
}

module.exports = main;