import {DiscordEvent} from "./discordEvent.js";
import type {Laffey} from "../../Laffey.js";
import type {Guild, Interaction, Message} from "discord.js";
import {Logger} from "../../utils/logger.js";

export default class guildCreate extends DiscordEvent {
    constructor(laffey: Laffey) {
        super(laffey, 'guildCreate');
    }

    async execute(guild: Guild) {
        Logger.log(`Joined guild: ${guild.name} (${guild.id}); ${guild.memberCount} members`, 'Laffey');
    }
}