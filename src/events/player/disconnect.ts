import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";

export default class disconnect extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'disconnect', 'shoukaku');
    }

    execute(name: string, count: number) {
        const players = [...this.player.shoukaku.players.values()].filter(p => p.node.name === name);
        players.map(player => {
            this.player.destroyPlayer(player.guildId);
            player.destroy().catch(() => void 0);
        });
        console.warn(`Lavalink ${name}: Disconnected (${count})`);
    }
}