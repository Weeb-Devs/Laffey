const {EmbedBuilder} = require('@discordjs/builders');
const {inspect} = require("util");
const Pagination = require("../../modules/Pagination");

module.exports = {
    name: "eval",
    description: "Evaluate a code",
    args: [{
        "name": "code",
        "description": "Code to execute",
        "type": 3,
        "required": true
    }],
    async execute(ctx, client) {
        if (!client.owners.includes(ctx.user.id)) return ctx.reply({embeds: [this.baseEmbed(`Unauthorized.`)]});
        let code = ctx.options.getString("code");

        await ctx.deferReply();
        try {
            let evalResult = eval(code);
            let type = evalResult
            if (typeof evalResult !== "string") evalResult = inspect(evalResult);

            let embeds = this.chunkSubstr(String(evalResult), 2000).map((s, i) => new EmbedBuilder()
                .setTitle('Result')
                .setDescription(`\`\`\`js` + '\n' + s + `\n` + `\`\`\``)
                .setColor(0x00C7FF)
                .setFooter({text: `Type: ${typeof type} | Time: ${new Date() - ctx.createdTimestamp}ms | Page ${i + 1} / ${this.chunkSubstr(String(evalResult), 2000).length}`})
            )
            return new Pagination(ctx, embeds, 120 * 1000).start();
        } catch (err) {
            console.log(err, "hm?")
            const embed = new EmbedBuilder()
                .setTitle('Result: Error')
                .setDescription(`\`\`\`js` + '\n' + err + `\n` + `\`\`\``)
                .setColor(0xff0000)
            ctx.editReply({embeds: [embed]})
        }
    }
}