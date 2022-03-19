const { MessageEmbed } = require('discord.js');
const handler = require('../../handlers/message');

module.exports = {
    name: 'about',
    description: 'See description about this project',
    usage: 'about',
    async execute(message) {
        const mainPage = new MessageEmbed()
            .setAuthor('Laffey', 'https://i.imgur.com/PbA3fp0.png')
            .setThumbnail('https://i.imgur.com/PbA3fp0.png')
            .setColor('#f5f5f5')
            .addField('Creator', '[Takiyo#7963](https://github.com/Takiyo0)', true)
            .addField('Organization', '[Weeb-Devs](https://github.com/Weeb-Devs)', true)
            .addField('Repository', '[Here](https://github.com/Weeb-Devs/Laffey)', true)
            .addField('Contributors', '[Here](https://github.com/Weeb-Devs/Laffey/graphs/contributors)', true)
            .addField('\u200b',
                `[Laffey](https://github.com/Weeb-Devs/Laffey) is [Weeb-Devs](https://github.com/Weeb-Devs)'s first project. Was created by our first member aka owner, Takiyo. He really wants to make his first open source project ever. Because he wants more for coding experience. In this project, he was challenged to make project with less bugs. Hope you enjoy using Laffey!`
            )
        message.channel.send(mainPage)
    }
}
