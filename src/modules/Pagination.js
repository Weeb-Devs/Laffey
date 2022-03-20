const {ActionRowBuilder, ButtonBuilder} = require("@discordjs/builders");
const {ButtonStyle} = require('discord.js');

module.exports = class LaffeyPagination {
    constructor(ctx, embeds, timeout) {
        this.ctx = ctx;
        this.embeds = embeds;
        this.timeout = !isNaN(timeout) ? timeout : 60 * 1000;
        this.filter = i => i.deferUpdate().catch(() => null) && !i.user.bot && i.user.id === this.ctx.user.id;

        this.page = 0;

        this.buttons = {
            left: (d) => new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("pagination:left").setEmoji({name: "◀️"}).setDisabled(!!d),
            trash: (d) => new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("pagination:trash").setEmoji({name: "❌"}).setDisabled(!!d),
            right: (d) => new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("pagination:right").setEmoji({name: "▶️"}).setDisabled(!!d)
        }
    }

    async start() {
        try {
            const row = new ActionRowBuilder().addComponents(this.buttons.left(true), this.buttons.trash(), this.buttons.right(!this.embeds.length - 1));
            const message = await this.ctx.editReply({embeds: [this.embeds[this.page]], components: [row]});
            const collector = message.createMessageComponentCollector({
                componentType: 2,
                time: this.timeout,
                filter: this.filter
            });

            collector.on("collect", b => this.controlHandler(b, message));
            collector.on("end", _ => message.edit({components: [new ActionRowBuilder().setComponents(this.buttons.trash(true))]}).catch(_ => void 0));
        } catch (e) {
            console.log(e)
        }
    }

    controlHandler(button, message) {
        const row = new ActionRowBuilder();

        switch (button.customId) {
            case "pagination:left": {
                if (this.embeds[this.page - 1]) message.edit({
                    embeds: [this.embeds[--this.page]],
                    components: [(() => {
                        for (let b of this.buttonHandler()) row.addComponents(b);
                        return row;
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
                    embeds: [this.embeds[++this.page]],
                    components: [(() => {
                        for (let b of this.buttonHandler()) row.addComponents(b);
                        return row;
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