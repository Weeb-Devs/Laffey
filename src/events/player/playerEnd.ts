import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer} from "kazagumo";

export default class playerEnd extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerEnd', 'kazagumo');
    }

    execute(player: KazagumoPlayer) {
        if (player.data.get('message')) player.data.get('message').delete().catch(() => void 0);
        player.data.delete('message');
    }
}