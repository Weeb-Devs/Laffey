import {ActivityType, type BitFieldResolvable, Client, type GatewayIntentsString} from "discord.js";
import {CommandService} from "./service/commandService.js";
import {PlayerService} from "./service/playerService.js";
import {SearchService} from "./service/searchService.js";
import {Logger} from "./utils/logger.js";
import {ConfigHandler} from "./utils/config.js";
import {DatabaseService} from "./service/databaseService.js";

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

        this.on("messageCreate", this.commands.handleMessage.bind(this.commands));

        this.on("interactionCreate", this.commands.handleInteraction.bind(this.commands));

        this.on("guildCreate", guild => Logger.log(`Joined guild: ${guild.name} (${guild.id}); ${guild.memberCount} members`, 'Laffey')
        );
        this.on("guildDelete", guild => Logger.log(`Left guild: ${guild.name} (${guild.id})`, 'Laffey'));

        this.on("clientReady", () => {
            Logger.log(`${this.user!.username} is ready`, 'Laffey');
            let statusList = ConfigHandler.statuses || [
                `Slash command! | ${this.guilds.cache.size} guild${this.guilds.cache.size <= 1 ? '' : 's'}`,
                `Slash command! | ${this.users.cache.size} user${this.users.cache.size <= 1 ? '' : 's'}`,
                `Slash command! | ${this.player?.players.size} player${this.player?.players.size <= 1 ? '' : 's'}`
            ];
            this.user?.setActivity(statusList[0]!, {type: ActivityType.Playing});
            if (statusList.length > 1) setInterval(() => {
                let chosenStatus = statusList[Math.round(Math.random() * statusList.length)]!;
                this.user?.setActivity(chosenStatus, {type: ActivityType.Playing});
            }, 40000);
            this.player.autoResume();
        });

        await this.player.prepare();
        await this.commands.loadCommands();
    }
}