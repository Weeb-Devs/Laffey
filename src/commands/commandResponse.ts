import {KazagumoTrack} from "kazagumo";
import {EmbedBuilder} from "../builder/embedBuilder.js";
import type {Song} from "genius-lyrics";
import {Logger} from "../utils/logger.js";

export enum CommandResponseType {
    normal,
    nowplaying,
    paginated,
    search,
    lyrics
}

export class CommandResponse {
    private constructor(public embeds: EmbedBuilder[] = [], public type: CommandResponseType = CommandResponseType.normal, public data?: any) {
    }

    static error(text: string, error?: Error): CommandResponse {
        if (error) Logger.errorStack('Command Error: ' + text, 'Command', error);
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

    static lyrics(data: Song[]) {
        return new CommandResponse([], CommandResponseType.lyrics, data);
    }
}

export interface SearchResponse {
    query: string;
    tracks: KazagumoTrack[];
}