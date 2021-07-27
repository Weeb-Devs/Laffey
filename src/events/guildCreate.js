module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild, client) {
        client.logger.debug('GUILD', `${guild.name} joined with ${guild.memberCount} users`)
    }
};