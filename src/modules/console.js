const chalk = require('chalk');
const log = console.log;
const error = console.error;

console.log = function () {
    let args = Array.from(arguments);
    args.unshift(chalk.yellowBright(require('moment')().format("dddd MMMM DD YYYY HH:MM:SS") + ": "));
    log.apply(console, args);
}

console.error = function () {
    let args = Array.from(arguments);
    args.unshift(chalk.yellowBright(require('moment')().format("dddd MMMM DD YYYY HH:MM:SS") + ": "));
    error.apply(console, args);
}