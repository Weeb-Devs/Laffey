const { readdirSync } = require('fs');
const { join } = require('path');

function main(client) {
    client.logger.debug('COMMANDS', 'Loading commands')
    let notImportant = []
    const categories = readdirSync(join(__dirname, "..", "commands"))
    categories.forEach(x => {
        const commands = readdirSync(join(__dirname, "..", "commands", x)).filter(z => z.endsWith('.js'))
        for (let command of commands) {
            command = require(`../commands/${x}/${command}`)
            client.commands.set(command.name, command)
            notImportant.push(command.name)
        }
    })
    client.logger.debug('COMMANDS', `Loaded ${notImportant.length} commands`)
}


module.exports = main;