const {ActionRowBuilder, ButtonBuilder} = require("@discordjs/builders");
const {ButtonStyle} = require('discord.js');

module.exports = {
    name: "invite",
    description: "Get my invite link",
    args: [],
    async execute(ctx, client) {
        let link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=36768832&scope=bot%20applications.commands`
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(link).setLabel("Invite Link")
        )
        return ctx.reply({embeds: [this.baseEmbed(`[Invite Link](${link})`)], components: [row]});
    }
}
