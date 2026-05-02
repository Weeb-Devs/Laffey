import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";

export default class PlayerReadyEvent extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'ready', 'shoukaku');
    }

    execute(name: string) {
        console.log(`[LAVALINK] => [STATUS] Lavalink ${name}: Ready!`);
    }
}