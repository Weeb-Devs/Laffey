import {
    type ApplicationCommandData,
    type ApplicationCommandOptionData,
    InteractionContextType
} from "discord.js";
import type {InteractionAdapter} from "../adapter/InteractionAdapter.js";
import {CommandResponse} from "./commandResponse.js";

export abstract class Command {
    protected constructor(private name: string,
                          private description: string,
                          private options: ApplicationCommandOptionData[] = [],
                          private data?: {
                              contexts?: InteractionContextType[]
                          }) {
    }

    abstract execute(ctx: InteractionAdapter): Promise<CommandResponse>;

    build(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            contexts: this.data?.contexts || [InteractionContextType.Guild]
        };
    }

    protected getResponse(text: string, error: boolean = false, err?: Error): CommandResponse {
        return error ? CommandResponse.error(text, err) : CommandResponse.successText(text);
    }
}