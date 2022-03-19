const { MessageEmbed, Message } = require('discord.js');
const paginator = require('../../modules/Pagination');
const { uptime, totalmem, freemem, cpus } = require('os');
const prettyMs = require('pretty-ms');

module.exports = {
    name: 'stats',
    description: 'Get bot\'s stats',
    usage: 'stats',
    async execute(message, args, client) {
        if (args[0]?.toLowerCase() === 'adv') {
            let page = new paginator([], { filter: (reaction, user) => user.id === message.author.id, timeout: 3600000 })
            const pageOne = new MessageEmbed()
                .setAuthor('Stats', client.user.displayAvatarURL())
                .setColor('#f5f5f5')
                .setDescription(`\`\`\`nim` + '\n' +
                    `Guilds          :: ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? 's' : ''}\n` +
                    `Users/Cached    :: ${client.users.cache.size} user${client.users.cache.size > 1 ? 's' : ''}/${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} cached user${(client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)) > 1 ? 's' : ''}\n` +
                    `Channels        :: ${client.channels.cache.size} channel${client.channels.cache.size > 1 ? 's' : ''}\n` +
                    `Emojis          :: ${client.emojis.cache.size} emoji${client.emojis.cache.size > 1 ? 's' : ''}\n` +
                    `Roles           :: ${client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0)} role${(client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0)) > 1 ? 's' : ''}\n` +
                    `Players         :: ${client.player.players.size} player${client.player.players.size > 1 ? 's' : ''}\n` +
                    `Uptime          :: ${prettyMs(client.uptime)}\n` +
                    `Server Uptime   :: ${prettyMs(uptime() * 1000)}\n` +
                    `\n` + `\`\`\``)

            const memusage = process.memoryUsage();
            const pageTwo = new MessageEmbed()
                .setAuthor('Stats', client.user.displayAvatarURL())
                .setColor('#f5f5f5')
                .setDescription(`\`\`\`nim` + '\n' +
                    `Total Memory  :: ${Math.round(totalmem() / 1024 / 1024)} mb\n` +
                    `Free Memory   :: ${Math.round(freemem() / 1024 / 1024)} mb\n` +
                    `RSS           :: ${Math.round(memusage.rss / 1024 / 1024)} mb\n` +
                    `Heap Total    :: ${Math.round(memusage.heapTotal / 1024 / 1024)} mb\n` +
                    `Heap Used     :: ${Math.round(memusage.heapUsed / 1024 / 1024)} mb\n` +
                    `External      :: ${Math.round(memusage.external / 1024 / 1024)} mb\n` +
                    `Array Buffer  :: ${Math.round(memusage.rss / 1024 / 1024)} mb\n` +
                    `\n` + `\`\`\``)

            const cs = cpus();
            const pageThree = new MessageEmbed()
                .setAuthor('Stats', client.user.displayAvatarURL())
                .setColor('#f5f5f5')
                .setDescription(`\`\`\`nim` + '\n' +
                    `CPU Model     :: ${cs[0].model}\n` +
                    `Cores         :: ${cs.length}\n` +
                    `Speed         :: ${cs[0].speed}Mhz\n` +
                    `Bot's Usage   :: ${await this.getCpuUsage()}%\n` +
                    `System        :: ${await this.getSystemCpuUsage()}%\n` +
                    `Idle          :: ${await this.getIdleCpuUsage()}%\n` +
                    `Platform      :: ${process.platform}\n` +
                    `PID           :: ${process.pid}\n` +
                    `\n` + `\`\`\``)


            page.add(pageOne)
            page.add(pageTwo)
            page.add(pageThree)
            page.setTransform((embed, index, total) => embed.setFooter(`Time: ${new Date() - message.createdTimestamp}ms | Page ${index + 1} / ${total}`))
            page.start(message.channel);
        } else {
            const mainEmbed = new MessageEmbed()
                .setAuthor('Stats', client.user.displayAvatarURL())
                .setColor('#f5f5f5')
                .setFooter('Use \`stats adv\` for more information')
                .setDescription(`\`\`\`nim` + '\n' +
                    `Guilds          :: ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? 's' : ''}\n` +
                    `Users/Cached    :: ${client.users.cache.size} user${client.users.cache.size > 1 ? 's' : ''}/${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} cached user${(client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)) > 1 ? 's' : ''}\n` +
                    `Channels        :: ${client.channels.cache.size} channel${client.channels.cache.size > 1 ? 's' : ''}\n` +
                    `Players         :: ${client.player.players.size} player${client.player.players.size > 1 ? 's' : ''}\n` +
                    `RSS/Heap Total  :: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} mb/${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} mb\n` +
                    `Uptime          :: ${prettyMs(client.uptime)}\n` +
                    `\n` + `\`\`\``)
            message.channel.send(mainEmbed)
        }
    },
    async getCpuUsage() {
        const cs = cpus();
        const percentage = cs.map((cpu, counter) => {
            let total = 0;
            for (let type in cpu.times) {
                total += cpu.times[type];
            }
            return Object.entries(cpu.times).map(t => Math.round(100 * t[1] / total))
        }).reduce((x, y) => x + y[0], 0) / cs.length
        return percentage;
    },
    async getSystemCpuUsage() {
        const cs = cpus();
        const percentage = cs.map((cpu, counter) => {
            let total = 0;
            for (let type in cpu.times) {
                total += cpu.times[type];
            }
            return Object.entries(cpu.times).map(t => Math.round(100 * t[1] / total))
        }).reduce((x, y) => x + y[2], 0) / cs.length
        return percentage;
    },
    async getIdleCpuUsage() {
        const cs = cpus();
        const percentage = cs.map((cpu, counter) => {
            let total = 0;
            for (let type in cpu.times) {
                total += cpu.times[type];
            }
            return Object.entries(cpu.times).map(t => Math.round(100 * t[1] / total))
        }).reduce((x, y) => x + y[3], 0) / cs.length
        return percentage;
    }
}