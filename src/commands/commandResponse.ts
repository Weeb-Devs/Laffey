import {KazagumoTrack} from "kazagumo";
import {EmbedBuilder} from "../builder/embedBuilder.js";
import type {Song} from "genius-lyrics";
import {Logger} from "../utils/logger.js";
import type {ActionRowBuilder, AnyComponentBuilder} from "@discordjs/builders";

export enum CommandResponseType {
    normal,
    nowplaying,
    paginated,
    search,
    lyrics,
    none
}

export class CommandResponse {
    private constructor(public embeds: EmbedBuilder[] = [], public type: CommandResponseType = CommandResponseType.normal, public data?: any, private _components?: ActionRowBuilder<AnyComponentBuilder>[]) {
    }

    public get components() {
        return this._components?.map(row => row.toJSON()) || [];
    }

    addComponent(action: ActionRowBuilder<AnyComponentBuilder>): CommandResponse {
        if (!this._components) this._components = [];
        this._components.push(action);
        return this;
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

    static none(): CommandResponse {
        return new CommandResponse([], CommandResponseType.none);
    }

    static successPaginated(embeds: EmbedBuilder[], type: CommandResponseType = CommandResponseType.paginated): CommandResponse {
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