import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import {Logger} from "../../utils/logger.js";

export default class PlayerReadyEvent extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'ready', 'shoukaku');
    }

    execute(name: string) {
        Logger.log(`Lavalink ${name}: Ready!`, 'Kazagumo');
    }
}