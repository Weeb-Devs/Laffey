const {readdirSync} = require('fs');
const {join} = require('path');
const {Routes} = require("discord-api-types/v9");
const {REST} = require('@discordjs/rest');
const {TOKEN} = new (require('./laffeyUtils'))();
const {getChoiceByChar, question} = require('cli-interact');

const commands = new Map();

console.log(`[SLASH REGISTER] -> Loading commands.`);
let notImportantCount = 0;
for (const x of readdirSync(join(__dirname, "..", "commands"))) {
    for (let command of readdirSync(join(__dirname, "..", "commands", x))) {
        command = require(`../commands/${x}/${command}`)
        commands.set(command.name, command);
        notImportantCount++;
    }
}
console.log(`[SLASH REGISTER] -> Loaded ${notImportantCount} commands.`);
let applicationId, result, guildId;

applicationId = question("What is your Application ID? (Your bot's user ID)");
result = getChoiceByChar("Where do you want to register the slash command", [
    "Global",
    "Guild"
]);

const body = {
    body: [...commands.values()].map(x => ({
        name: x.name,
        description: x.description ? x.description : '',
        options: x.args ? x.args : [],
        default_permission: true
    }))
}

if (result === "Global") return registerGlobal();
if (result === "Guild") {
    guildId = question("What is the Guild ID that you want to register in?");
    return registerGuild(guildId);
}


async function registerGuild(guildId) {
    const rest = new REST().setToken(TOKEN);
    console.log(`[SLASH REGISTER] -> Refreshing GUILD slash commands on ${guildId}.`);
    const {s, e} = await rest.put(Routes.applicationGuildCommands(applicationId, guildId), body).catch(_ => ({
        s: false,
        e: _.toString()
    }));
    if (typeof s === "boolean") return console.log(`[SLASH COMMANDS REGISTER] -> There was an error while registering the slash command. ${e}`);
    console.log(`[SLASH COMMANDS REGISTER] -> Refreshed GUILD slash command.`);
}

async function registerGlobal() {
    const rest = new REST().setToken(TOKEN);
    console.log(`[SLASH REGISTER] -> Refreshing GLOBAL slash commands.`);
    const {s, e} = await rest.put(Routes.applicationCommands(applicationId), body).catch(_ => ({
        s: false,
        e: _.toString()
    }));
    if (typeof s === "boolean") return console.log(`[SLASH COMMANDS REGISTER] -> There was an error while registering the slash command. ${e}`);
    console.log(`[SLASH COMMANDS REGISTER] -> Refreshed GLOBAL slash command. You may need a few minutes until it registered to all guilds.`);
}