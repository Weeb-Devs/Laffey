const { DEBUG } = new (require('../modules/laffeyUtils'))();
const chalk = require('chalk');

class logger {
    error(error) {
        console.error(error)
    }

    debug(name, content) {
        DEBUG ? console.log(chalk.yellow(`[DEBUG] => [${name ? name : 'Unknown'}] ${content}`)) : ''
    }

    eventDebug(name, content) {
        DEBUG ? console.log((`[EVENT DEBUG] => [${name ? name : 'Unknown'}] ${content}`)) : ''
    }

    log(name, content) {
        console.log(chalk.green(`[LOGS] => [${name}] ${content}`))
    }
}

module.exports = logger;
