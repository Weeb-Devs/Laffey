const { get, set, reset } = require('../../functions/prefix');
const { MessageEmbed } = require('discord.js');
const handler = require('../../handlers/message.ts');

module.exports = {
    name: 'prefix',
    description: 'Set/get prefix',
    usage: 'prefix [ new prefix ]',
    async execute(message, args, client) {
        if (!client.database) return message.channel.send(new handler().normalEmbed('Please ask developer to give a valid MongoDB URI.'))
        const opt = args[0]
        const newPrefix = args[1]

        switch (opt) {
            case 'set': {
                if (!newPrefix) return message.channel.send(new handler().noArgument(client, this.name, ['prefix set < new prefix >', 'reset']))
                set(client, message.guild.id, newPrefix).then(x => {
                    if (!x.error) return message.channel.send(new handler().normalEmbed('Successfully changed the prefix to ' + newPrefix))
                })
                break;
            }

            case 'reset': {
                reset(client, message.guild.id).then(x => {
                    if (x.error) return message.channel.send(new handler().normalEmbed('There\'s no custom prefix was saved'))
                    return message.channel.send(new handler().normalEmbed('Successfully reset the prefix'))
                })
                break;
            }

            default: {
                get(message.guild.id).then(x => {
                    return message.channel.send(new handler().normalEmbed(`My current prefix on **${message.guild.name}** is ${x.error ? client.defaultPrefix : x.prefix}\n\n\`${x.error ? client.defaultPrefix : x.prefix}prefix set\` to set a new prefix`))
                })
                break
            }
        }
    }
}