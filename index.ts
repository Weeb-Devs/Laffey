import {Laffey} from "./src/Laffey.js";
import {GatewayIntentBits} from "discord.js";
import {ConfigHandler} from "./src/utils/config.js";
import {Logger} from "./src/utils/logger.js";

const laffey = new Laffey([
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
])
laffey.prepare().then(() => {
    Logger.log(`Done preparing`, 'Laffey');
    laffey.login(ConfigHandler.token).catch((err) => {
        Logger.errorStack(`Failed to login: ${err.message}`, 'Laffey', err as Error);
    });
});