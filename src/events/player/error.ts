import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import {Logger} from "../../utils/logger.js";

export default class error extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'error', 'shoukaku');
    }

    execute(name: string, error: Error) {
        Logger.errorStack(`Lavalink ${name}: Error`, 'Kazagumo', error);
    }
}