module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(guild, client) {
        client.logger.debug('GUILD', `${guild.name} left`)
    }
};