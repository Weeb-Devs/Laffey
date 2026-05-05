import {PlayerEvent} from "./playerEvent.js";
import {PlayerService} from "../../service/playerService.js";
import {type KazagumoPlayer} from "kazagumo";

export default class queueUpdate extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'queueUpdate', 'kazagumo');
    }

    async execute(player: KazagumoPlayer) {
        this.player.client.db.db.setPlayer(player.guildId, PlayerService.buildDbPlayer(player)).catch(() => undefined);
    }
}