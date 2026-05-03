import {type APIEmbed, EmbedBuilder as DiscordEmbedBuilder, type EmbedFooterOptions} from "discord.js";
import {ConfigHandler} from "../utils/config.js";

export type EmbedColor = 'default' | 'success' | 'error' | 'warning';

export class EmbedBuilder extends DiscordEmbedBuilder {
    constructor(text?: string, color: EmbedColor = 'default', private noFooter = false) {
        super();

        if (text) {
            const hasMarkdown = text.match(/\*\*|\*|~~|_|`|~|\||>/g);
            if (hasMarkdown || text.length > 256) this.setDescription(text);
            else this.setAuthor({name: text});
        }

        this.setColor(ConfigHandler.getEmbedColor(color));

        const footer = ConfigHandler.embedFooter;
        if (footer && !noFooter) this.data.footer = footer;
    }

    setFooter(options: EmbedFooterOptions | null): this {
        const footer = ConfigHandler.embedFooter;
        if (options?.text) this.data.footer = {text: options.text + (footer && !this.noFooter ? ` | ${footer.text}` : '')};
        if (options?.iconURL) options.iconURL = options.iconURL;
        return this;
    }

    toJSON(): APIEmbed {
        return super.toJSON();
    }
}