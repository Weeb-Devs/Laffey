const { MessageEmbed, splitMessage } = require('discord.js');
const { inspect } = require("util");
const paginator = require('../../modules/Pagination');

module.exports = {
    name: 'eval',
    description: 'Evaluate code',
    usage: 'eval < code >',
    async execute(message, args, client) {
        if (!client.owners.includes(message.author.id))
            return message.channel.send('Unauthorized');

        try {
            const code = args.join(" ")
            let evaled = eval(code);
            let type = evaled
            if (typeof evaled !== "string") evaled = inspect(evaled);
            evaled = this.clean(evaled)
            evaled = splitMessage(evaled, {
                maxLength: 1520,
                char: "\n",
                prepend: "",
                append: ""
            });
            let page = new paginator([], { filter: (reaction, user) => user.id === message.author.id, timeout: 3600000 })
            evaled.forEach((code, index) => {
                let result = new MessageEmbed()
                    .setTitle('Result')
                    .setDescription(`\`\`\`js` + '\n' + code + `\n` + `\`\`\``)
                    .setColor('#00C7FF')
                page.add(result)
            })
            page.setTransform((embed, index, total) => embed.setFooter(`Type: ${typeof type} | Time: ${new Date() - message.createdTimestamp}ms | Page ${index + 1} / ${total}`))
            page.start(message.channel);

        } catch (err) {
            const embed = new MessageEmbed()
                .setAuthor('eval', client.user.displayAvatarURL())
                .setDescription(`\`\`\`js` + '\n' + this.clean(err) + `\n` + `\`\`\``)
                .setColor('RED')
            message.channel.send(embed)
        }
    },
    clean(text) {
        return typeof text === "string" ? text.replace(/[`@]/g, x => x + "\u200b") : text;
    }
}
