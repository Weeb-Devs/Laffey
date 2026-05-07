import chalk from "chalk";
import {ConfigHandler} from "./config.js";

export class Logger {
    static log(message: string, service: string) {
        console.log(chalk.bgBlue("LOG\t") + chalk.blue(` [${new Date().toLocaleTimeString()}]`) + chalk.green(` [${service}]`) + chalk.white(` ${message}`));
    }

    static warn(message: string, service: string) {
        console.warn(chalk.bgYellow("WARN\t") + chalk.yellow(` [${new Date().toLocaleTimeString()}]`) + chalk.green(` [${service}]`) + chalk.white(` ${message}`));
    }

    static error(message: string, service: string) {
        console.error(chalk.bgRed("ERROR\t") + chalk.red(` [${new Date().toLocaleTimeString()}]`) + chalk.green(` [${service}]`) + chalk.white(` ${message}`));
    }

    static errorStack(message: string, service: string, error: Error) {
        console.error(chalk.bgRed("ERROR\t") + chalk.red(` [${new Date().toLocaleTimeString()}]`) + chalk.green(` [${service}]`) + chalk.white(` ${message}`));
        console.error(chalk.red(error.stack || error.message));
    }

    static debug(message: string, service: string) {
        if (!ConfigHandler.isDev) return;
        console.log(chalk.bgYellow("DEBUG\t") + chalk.yellow(` [${new Date().toLocaleTimeString()}]`) + chalk.green(` [${service}]`) + chalk.white(` ${message}`));
    }
}