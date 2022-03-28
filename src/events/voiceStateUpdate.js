const {EmbedBuilder} = require("@discordjs/builders");

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldC, newC, client) {
        if (oldC.id === client.user.id) return;
        const target = await client.users.fetch(oldC.id)
        if (target.bot) return;
        
        if (client.player?.players.get(newC.guild.id) && oldC.channelId && !newC.channelId) {
            if (client.player?.players.get(newC.guild.id).get('24h').status === true) return;
            if (client.channels.cache.get(client.player?.players.get(newC.guild.id).voiceChannel).members.filter(x => !x.user.bot).size === 0) {
                if (client.voiceTimeout.get(newC.guild.id)) clearTimeout(client.voiceTimeout.get(newC.guild.id));
                const timeout = setTimeout(() => {
                    if (client.player?.players.get(newC.guild.id) && client.channels.cache.get(client.player?.players.get(newC.guild.id).voiceChannel).members.filter(x => !x.user.bot).size === 0) {
                        const leftEmbed = new EmbedBuilder()
                            .setDescription('Destroying player and leaving voice channel due to inactivity')
                            .setColor(0xFF0000)
                        client.channels.cache.get(client.player?.players.get(newC.guild.id).textChannel)?.send({embeds: [leftEmbed]})
                        client.player?.players.get(newC.guild.id).destroy()
                    }
                    clearTimeout(client.voiceTimeout.get(newC.guild.id))
                }, 120 * 1000);
                client.voiceTimeout.set(newC.guild.id, { timeout })
            }
        }
    }
};
