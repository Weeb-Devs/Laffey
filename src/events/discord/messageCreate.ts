import {DiscordEvent} from "./discordEvent.js";
import type {Laffey} from "../../Laffey.js";
import type {Message} from "discord.js";

export default class messageCreate extends DiscordEvent {
    constructor(laffey: Laffey) {
        super(laffey, 'messageCreate');
    }

    async execute(message: Message) {
        await this.laffey.commands.handleMessage(message);
    }
}