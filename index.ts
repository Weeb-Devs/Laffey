import {Laffey} from "./src/Laffey.js";
import {GatewayIntentBits} from "discord.js";
import {ConfigHandler} from "./src/utils/config.js";

const laffey = new Laffey([
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
])
laffey.prepare().then(() => {
    console.log(`Done preparing`);
    laffey.login(ConfigHandler.token);
});