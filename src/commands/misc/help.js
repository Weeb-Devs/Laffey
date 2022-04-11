const {EmbedBuilder} = require("@discordjs/builders");

module.exports = {
    name: "help",
    description: "Returns all of my commands",
    args: [],
    async execute(ctx, client) {
        let categories = {};

        for (let c of [...client.commands.values()]) categories[`${c.category}`] ? categories[`${c.category}`].push(c) : categories[`${c.category}`] = [c];

        const embed = new EmbedBuilder()
            .setTitle("Help")
            .setDescription(Object.entries(categories).map(([category, command]) => {
                return `**${category}**:\n${command.map((c) => `\`${c.name}\``).join(", ")}`
            }).join("\n\n"))
            .setColor(0xff0000);

        return ctx.reply({embeds: [embed]});
    }
}
