import {KazagumoTrack} from "kazagumo";
import {EmbedBuilder} from "../builder/embedBuilder.js";

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
            new EmbedBuilder(text, "error")
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
            new EmbedBuilder(text, "success")
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