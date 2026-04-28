import {type APIEmbed, EmbedBuilder, type EmbedData} from "discord.js";

export enum CommandResponseType {
    normal,
    nowplaying,
    paginated
}

export class CommandResponse {
    private constructor(public embeds: EmbedBuilder[] = [], public type: CommandResponseType = CommandResponseType.normal) {
    }

    static error(text: string, error?: Error): CommandResponse {
        return new CommandResponse([
            new EmbedBuilder()
                .setColor("Red")
                .setDescription(text)
        ]);
    }

    static success(embed: EmbedBuilder, type?: CommandResponseType): CommandResponse {
        return new CommandResponse([embed], type);
    }

    static successPaginated(embeds: EmbedBuilder[], type?: CommandResponseType): CommandResponse {
        return new CommandResponse(embeds, type);
    }

    static successText(text: string): CommandResponse {
        return new CommandResponse([
            new EmbedBuilder()
                .setColor("Green")
                .setDescription(text)
        ]);
    }
}