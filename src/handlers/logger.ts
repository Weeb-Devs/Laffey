const { DEBUG } = require('../../config.json');
const chalk = require('chalk');

class logger {
    error(error) {
        console.error(chalk.red(`[ERROR]` + error))
    }

    debug(name, content) {
        DEBUG ? console.log(chalk.yellow(`[DEBUG] => [${name ? name : 'Unknown'}] ${content}`)) : ''
    }

    eventDebug(name, content) {
        DEBUG ? console.log((`[DEBUG] => [${name ? name : 'Unknown'}] ${content}`)) : ''
    }

    log(name, content) {
        console.log(chalk.green(`[DEBUG] => [${name}] ${content}`))
    }
}

module.exports = logger;