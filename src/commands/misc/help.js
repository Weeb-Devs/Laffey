const { MessageEmbed } = require('discord.js');
const handler = require('../../handlers/message');
const fs = require('fs');
const { join } = require("path");


module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'List all available commands',
    usage: 'help [ category | command ]',
    async execute(message, args, client) {
        try {
            if (!args[0]) {
                let helpEmbed = new MessageEmbed()
                    .setAuthor('Help', client.user.displayAvatarURL())
                    .setColor([245, 245, 245, 1])
                    .setDescription(`My current prefix in **${message.guild.name}** is \`${client.prefixes.get(message.guild.id) ? client.prefixes.get(message.guild.id).prefix : client.defaultPrefix}\``)
                    .setFooter(`${client.prefixes.get(message.guild.id) ? client.prefixes.get(message.guild.id).prefix : client.defaultPrefix}help [ category | command ] for more information`)

                const commandFolders = fs.readdirSync(join(__dirname, "..", "..", "commands"))
                let allCategories = []
                commandFolders.forEach((categories, index) => {
                    const counter = index++ + 1;
                    allCategories.push(`${counter}. ${categories} \`${client.prefixes.get(message.guild.id) ? client.prefixes.get(message.guild.id).prefix : client.defaultPrefix}help ${categories}\` `)
                });
                helpEmbed.addField(`Available Categories`, allCategories.join('\n ').replace(/_/gi, ' '))
                helpEmbed.addField(`Additional Links`, `[Source](https://www.google.com)`)
                return message.channel.send(helpEmbed)
            } else {
                let helpEmbed = new MessageEmbed()
                    .setAuthor('Help', client.user.displayAvatarURL())
                    .setColor([245, 245, 245, 1])
                    .setDescription(`My current prefix in **${message.guild.name}** is \`${client.prefixes.get(message.guild.id) ? client.prefixes.get(message.guild.id).prefix : client.defaultPrefix}\``)

                let commandFile, category, error;
                try {
                    commandFile = fs.readdirSync(join(__dirname, '..', '..', 'commands', `${args[0]?.toLowerCase()}`)).filter((file) => file.endsWith(".js"));
                    category = true;
                } catch (err) {
                    if (client.commands.find(x => x.name == args[0]?.toLowerCase() || x.aliases && x.aliases.includes(args[0]?.toLowerCase()))) {
                        commandFile = client.commands.find(x => x.name == args[0]?.toLowerCase() || x.aliases && x.aliases.includes(args[0]?.toLowerCase()))
                        category = false;
                    } else {
                        error = true
                    }
                }
                if (error) return message.channel.send(new handler().normalEmbed(`No category or command was found!`))
                if (category) {
                    helpEmbed.addField(`${args[0]?.toLowerCase()} [${commandFile.length}]`, '```' + commandFile.join(', ').replace(/.js/gi, '') + '```')
                    message.channel.send(helpEmbed)
                } else {
                    helpEmbed.addField(`Name`, `${commandFile.name ? commandFile.name : "unknown"}`, true)
                    helpEmbed.addField(`Aliases`, `${(commandFile.aliases && commandFile.aliases.length != 0) ? commandFile.aliases.join(', ') : "-"}`, true)
                    helpEmbed.addField(`Usage`, `${client.prefixes.get(message.guild.id) ? client.prefixes.get(message.guild.id).prefix : client.defaultPrefix}${commandFile.usage ? commandFile.usage : "-"}`, true)
                    helpEmbed.addField(`Description`, `${commandFile.description ? commandFile.description : "-"}`)
                    message.channel.send(helpEmbed)
                }
            }
        } catch (err) {
            message.channel.send(new handler().normalEmbed(`Error! ${err}`))
        }
    }
}