import {DiscordEvent} from "./discordEvent.js";
import type {Laffey} from "../../Laffey.js";
import {Logger} from "../../utils/logger.js";
import {ConfigHandler} from "../../utils/config.js";
import {ActivityType} from "discord.js";

export default class clientReady extends DiscordEvent {
    constructor(laffey: Laffey) {
        super(laffey, 'clientReady');
    }

    async execute() {
        Logger.log(`${this.laffey.user!.username} is ready`, 'Laffey');
        let statusList = ConfigHandler.statuses || [
            `Slash command! | ${this.laffey.guilds.cache.size} guild${this.laffey.guilds.cache.size <= 1 ? '' : 's'}`,
            `Slash command! | ${this.laffey.users.cache.size} user${this.laffey.users.cache.size <= 1 ? '' : 's'}`,
            `Slash command! | ${this.laffey.player?.players.size} player${this.laffey.player?.players.size <= 1 ? '' : 's'}`
        ];
        this.laffey.user?.setActivity(statusList[0]!, {type: ActivityType.Playing});
        if (statusList.length > 1) setInterval(() => {
            let chosenStatus = statusList[Math.round(Math.random() * statusList.length)]!;
            this.laffey.user?.setActivity(chosenStatus, {type: ActivityType.Playing});
        }, 40000);
        await this.laffey.player.autoResume();
    }
}