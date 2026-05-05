import {DiscordEvent} from "./discordEvent.js";
import type {Laffey} from "../../Laffey.js";
import type {Guild, Interaction, Message} from "discord.js";
import {Logger} from "../../utils/logger.js";

export default class guildDelete extends DiscordEvent {
    constructor(laffey: Laffey) {
        super(laffey, 'guildDelete');
    }

    async execute(guild: Guild) {
        Logger.log(`Left guild: ${guild.name} (${guild.id})`, 'Laffey');
    }
}