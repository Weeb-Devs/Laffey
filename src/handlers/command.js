const {readdirSync} = require('fs');
const {join} = require('path');

function main() {
    this.logger.debug('COMMANDS', 'Loading commands')
    let notImportantCount = 0;
    for (const x of readdirSync(join(__dirname, "..", "commands"))) {
        for (let command of readdirSync(join(__dirname, "..", "commands", x))) {
            command = require(`../commands/${x}/${command}`)
            this.commands.set(command.name, ({category: x, ...command}))
            notImportantCount++;
        }
    }
    this.logger.debug('COMMANDS', `Loaded ${notImportantCount} commands`)
}

module.exports = main;
