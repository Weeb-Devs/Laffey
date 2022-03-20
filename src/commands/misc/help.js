const {EmbedBuilder} = require("@discordjs/builders");

module.exports = {
    name: "help",
    description: "Get all commands",
    args: [],
    async execute(ctx, client) {
        let categories = {};

        for (let c of [...client.commands.values()]) categories[`${c.category}`] ? categories[`${c.category}`].push(c) : categories[`${c.category}`] = [c];

        const embed = new EmbedBuilder()
            .setTitle("Help")
            .setDescription(Object.entries(categories).map(([category, command]) => {
                return `**${category}**:\n${command.map((c, i) => `${i + 1} - ${c.name}\n \u00A0 \u00A0${c.description} \u00A0 \u00A0${c.args?.length ? c.args.map(x => `\n\`${x.name}\``).join(", ") : ""}`).join("\n")}`
            }).join("\n\n"));

        return ctx.reply({embeds: [embed]});
    }
}