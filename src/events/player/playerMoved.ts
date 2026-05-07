import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer, PlayerMovedChannels, PlayerMovedState} from "kazagumo";

export default class playerMoved extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerMoved', 'kazagumo');
    }

    execute(player: KazagumoPlayer, state: PlayerMovedState, channels: PlayerMovedChannels) {
        switch (state) {
            case "LEFT":
                if (player.data.get('empty.timeout')) clearTimeout(player.data.get('empty.timeout'));
                return player.destroy();
            case "MOVED":
                if (channels.newChannelId) player.setVoiceChannel(channels.newChannelId);
        }
    }
}