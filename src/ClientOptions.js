const {GatewayIntentBits} = require("discord.js");
const {
    Guilds,
    GuildVoiceStates,
    GuildMessages,
    GuildMessageReactions
} = GatewayIntentBits;

module.exports = {
    intents: [Guilds, GuildVoiceStates, GuildMessages, GuildMessageReactions]
}