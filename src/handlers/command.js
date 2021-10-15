const { readdirSync } = require('fs');
const { join } = require('path');

function main(client) {
    client.logger.debug('COMMANDS', 'Loading commands')
    let notImportantCount = 0;
    for (const x of readdirSync(join(__dirname, "..", "commands"))) {
        for (let command of readdirSync(join(__dirname, "..", "commands", x))) {
            command = require(`../commands/${x}/${command}`)
            client.commands.set(command.name, command)
            notImportantCount++;
        }
    }
    client.logger.debug('COMMANDS', `Loaded ${notImportantCount} commands`)
}

module.exports = main;
