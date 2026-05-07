import type {Laffey} from "../../Laffey.js";

export abstract class DiscordEvent {
    constructor(protected readonly laffey: Laffey, public readonly name: string, public readonly once: boolean = false) {
    }

    abstract execute(...args: any): void;
}