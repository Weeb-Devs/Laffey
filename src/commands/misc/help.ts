import type {InteractionAdapter} from "../../adapter/InteractionAdapter.js";
import {Command} from "../Command.js";
import {CommandResponse} from "../commandResponse.js";

export default class help extends Command {
    constructor() {
        super('help', 'get help')
    }

    async execute(ctx: InteractionAdapter): Promise<CommandResponse> {
        return CommandResponse.successText('test');
    }
}
