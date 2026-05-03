import {type BitFieldResolvable, Client, type GatewayIntentsString} from "discord.js";
import {CommandService} from "./service/commandService.js";
import {PlayerService} from "./service/playerService.js";
import {SearchService} from "./service/searchService.js";
import {Logger} from "./utils/logger.js";

export class Laffey extends Client {
    public readonly commands: CommandService = new CommandService(this);
    public readonly player: PlayerService = new PlayerService(this);
    public readonly search: SearchService = new SearchService(this);

    constructor(intents: BitFieldResolvable<GatewayIntentsString, number>) {
        super({intents});
    }

    public async prepare() {

        this.on("messageCreate", this.commands.handleMessage.bind(this.commands));

        this.on("interactionCreate", this.commands.handleInteraction.bind(this.commands));

        this.on("clientReady", () => Logger.log(`${this.user!.username} is ready`, 'Laffey'));

        await this.player.prepare();
        await this.commands.loadCommands();
    }
}