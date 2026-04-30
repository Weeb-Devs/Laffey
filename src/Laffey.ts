import {type BitFieldResolvable, Client, type GatewayIntentsString} from "discord.js";
import {CommandService} from "./service/commandService.js";
import {PlayerService} from "./service/playerService.js";
import {SearchService} from "./service/searchService.js";

export class Laffey extends Client {
    public readonly commands: CommandService = new CommandService(this);
    public readonly player: PlayerService = new PlayerService(this);
    public readonly search: SearchService = new SearchService(this);

    constructor(intents: BitFieldResolvable<GatewayIntentsString, number>) {
        super({intents});
    }

    public async prepare() {

        this.on("messageCreate", (ctx) => {
            console.log(ctx.content)
            this.commands.handleMessage(ctx);
        });

        this.on("interactionCreate", (ctx) => {
            this.commands.handleInteraction(ctx);
        });

        this.on("clientReady", () => {
            console.log(`${this.user!.username} is ready`);
        });

        await this.player.prepare();
        await this.commands.loadCommands();
    }
}