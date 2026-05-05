import {type BitFieldResolvable, Client, type GatewayIntentsString} from "discord.js";
import {CommandService} from "./service/commandService.js";
import {PlayerService} from "./service/playerService.js";
import {SearchService} from "./service/searchService.js";
import {Logger} from "./utils/logger.js";
import {DatabaseService} from "./service/databaseService.js";
import path from "node:path";
import fs from "node:fs";
import type {DiscordEvent} from "./events/discord/discordEvent.js";

export class Laffey extends Client {
    public readonly commands: CommandService = new CommandService(this);
    public readonly player: PlayerService = new PlayerService(this);
    public readonly search: SearchService = new SearchService(this);
    public readonly db: DatabaseService = new DatabaseService();

    constructor(intents: BitFieldResolvable<GatewayIntentsString, number>) {
        super({intents});
    }

    public async prepare() {
        try {
            await this.db.prepare();
            Logger.log("Database initialized successfully", 'Laffey');
        } catch (err) {
            Logger.errorStack(`Failed to initialize database: ${err instanceof Error ? err.message : String(err)}`, 'Laffey', err as Error);
            throw err;
        }

        await this.listenEvents();
        await this.player.prepare();
        await this.commands.loadCommands();
    }

    private async listenEvents() {
        const basePath = path.join("src", "events", "discord");
        const events = fs.readdirSync(basePath);
        for (const event of events) {
            if (event.startsWith("discordEvent")) continue;
            const eventPath = path.join(process.cwd(), basePath, event);
            const modUrl = `file://${eventPath}?t=${Date.now()}`;
            const mod = await import(modUrl);
            const ev = new mod.default(this) as DiscordEvent;
            Logger.debug(`Loaded ${ev.name} event`, 'Laffey');
            if (ev.once) {
                this.once(ev.name as any, (...args: any[]) => ev.execute(...args));
            } else {
                this.on(ev.name as any, (...args: any[]) => ev.execute(...args));
            }
        }
        Logger.log(`Loaded ${events.length} events`, 'Laffey');
    }
}