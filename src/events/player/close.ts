import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";

export default class close extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'close', 'shoukaku');
    }

    execute(name: string, code: number, reason: string) {
        console.warn(`Lavalink ${name}: Closed, code: ${code}, reason: ${reason}`);
    }
}