import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import {Logger} from "../../utils/logger.js";

export default class close extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'close', 'shoukaku');
    }

    execute(name: string, code: number, reason: string) {
        Logger.warn(`Lavalink ${name}: Closed, code: ${code}, reason: ${reason}`, 'Kazagumo');
    }
}