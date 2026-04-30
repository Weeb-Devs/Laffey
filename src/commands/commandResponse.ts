import {EmbedBuilder} from "discord.js";
import {KazagumoTrack} from "kazagumo";

export enum CommandResponseType {
    normal,
    nowplaying,
    paginated,
    search
}

export class CommandResponse {
    private constructor(public embeds: EmbedBuilder[] = [], public type: CommandResponseType = CommandResponseType.normal, public data?: any) {
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

    static search(data: SearchResponse) {
        return new CommandResponse([], CommandResponseType.search, data);
    }
}

export interface SearchResponse {
    query: string;
    tracks: KazagumoTrack[];
}