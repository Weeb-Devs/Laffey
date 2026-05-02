import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";

export default class error extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'error', 'shoukaku');
    }

    execute(name: string, error: Error) {
        console.error(`Lavalink ${name}: Error`, error);
    }
}