import {Command} from "../Command.js";
import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {CommandResponse} from "../commandResponse.js";
import {ActionRowBuilder, ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";

export default class invite extends Command {
    constructor() {
        super('invite', 'Get the bot invite link');
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        let link = `https://discord.com/api/oauth2/authorize?client_id=${ctx.client.user?.id}&permissions=36768832&scope=bot%20applications.commands`;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(link).setLabel("Invite Link")
        );
        return CommandResponse.successText("Click the button below to invite the bot to your server!").addComponent(row);
    }
}