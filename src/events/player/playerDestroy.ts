import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer} from "kazagumo";

export default class playerDestroy extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerDestroy', 'kazagumo');
    }

    async execute(player: KazagumoPlayer) {
        await this.player.client.db.db.deletePlayer(player.guildId).catch(() => undefined);
    }
}