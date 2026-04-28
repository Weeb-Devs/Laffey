import type {InteractionAdapter} from "../adapter/InteractionAdapter.js";
import {
    type BaseInteraction,
    ButtonInteraction,
    ButtonStyle,
    type EmbedBuilder,
    InteractionResponse,
    type Message
} from "discord.js";
import {ActionRowBuilder, ButtonBuilder} from "@discordjs/builders";

export class Pagination {
    private buttons = {
        left: (d?: boolean) => new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("pagination:left").setEmoji({name: "◀️"}).setDisabled(!!d),
        trash: (d?: boolean) => new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("pagination:trash").setEmoji({name: "❌"}).setDisabled(!!d),
        right: (d?: boolean) => new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("pagination:right").setEmoji({name: "▶️"}).setDisabled(!!d)
    }
    private page = 0;

    constructor(private msg: Message | InteractionResponse, private interaction: InteractionAdapter, private embeds: EmbedBuilder[]) {
    }

    async start() {
        const row = new ActionRowBuilder().addComponents(this.buttons.left(true), this.buttons.trash(), this.buttons.right());
        const message = await this.msg.edit({
            embeds: [this.embeds[this.page]!.toJSON()],
            components: [row.toJSON()]
        });
        if (!message) throw new Error("Message not found");
        const collector = message.createMessageComponentCollector({
            componentType: 2,
            time: 5 * 60 * 1000,
            filter: (i) => {
                i.deferUpdate().catch(() => undefined);
                return !i.user.bot && i.user.id === this.interaction.user?.id;
            }
        });

        collector.on("collect", b => this.controlHandler(b, message));
        collector.on("end", _ => message.edit({components: [new ActionRowBuilder().setComponents(this.buttons.trash(true)).toJSON()]}).catch(_ => void 0));
    }

    controlHandler(button: ButtonInteraction, message: Message) {
        const row = new ActionRowBuilder();

        switch (button.customId) {
            case "pagination:left": {
                if (this.embeds[this.page - 1]) message.edit({
                    embeds: [this.embeds[--this.page]!.toJSON()],
                    components: [(() => {
                        for (let b of this.buttonHandler()) row.addComponents(b);
                        return row.toJSON();
                    })()]
                }).catch(_ => void 0);
                break;
            }

            case "pagination:trash": {
                message.delete().catch(_ => void 0);
                break;
            }

            case "pagination:right": {
                if (this.embeds[this.page + 1]) message.edit({
                    embeds: [this.embeds[++this.page]!.toJSON()],
                    components: [(() => {
                        for (let b of this.buttonHandler()) row.addComponents(b);
                        return row.toJSON();
                    })()]
                }).catch(_ => void 0);
                break;
            }
        }
    }

    buttonHandler() {
        if (this.page === 0) return [this.buttons.left(true), this.buttons.trash(), this.buttons.right()];
        if (this.page === this.embeds.length - 1) return [this.buttons.left(), this.buttons.trash(), this.buttons.right(true)];
        else return [this.buttons.left(), this.buttons.trash(), this.buttons.right()];
    }
}