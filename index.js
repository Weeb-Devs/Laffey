const chalk = require('chalk');
require('dotenv').config()
require('./src/modules/console');
console.log(chalk.yellow('----------------------------------------------------------------------------------------------'))
console.log()
console.log(chalk.red('Found a bug? Feel free to create new issue here. https://github.com/Weeb-Devs/Laffey/issues/new'))
console.log(chalk.red('⚠️This version is a major version. Bug is probably still hanging around. Please report if you found ⚠️'))
console.log(chalk.yellow(`Version: ${require('./package.json').version}`))
console.log()
console.log(chalk.yellow('----------------------------------------------------------------------------------------------'))
console.log()
const Laffey = require('./src/Laffey');

new Laffey().login()
    .catch(err => console.error(err))
