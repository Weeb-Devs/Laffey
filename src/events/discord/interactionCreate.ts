import {DiscordEvent} from "./discordEvent.js";
import type {Laffey} from "../../Laffey.js";
import type {Interaction} from "discord.js";

export default class interactionCreate extends DiscordEvent {
    constructor(laffey: Laffey) {
        super(laffey, 'interactionCreate');
    }

    async execute(interaction: Interaction) {
        Promise.all([
            this.laffey.commands.handleInteraction(interaction),
            this.laffey.player.handleInteraction(interaction)
        ]).then(() => undefined);
    }
}