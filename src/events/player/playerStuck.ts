import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer} from "kazagumo";
import type {TrackStuckEvent} from "shoukaku";
import {EmbedBuilder} from "../../builder/embedBuilder.js";
import {TextChannel} from "discord.js";

export default class playerStuck extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerStuck', 'kazagumo');
    }

    execute(player: KazagumoPlayer, data: TrackStuckEvent) {
        if (!player.textId) return;
        const channel = this.player.client.channels.cache.get(player.textId);
        if (!channel || !(channel instanceof TextChannel)) return;

        const embed = new EmbedBuilder(undefined, "error", true)
            .setTitle("Track Stuck")
            .setDescription(`${data.track.info.title} has been stuck for ${data.thresholdMs}ms and has been skipped.`);
        channel.send({embeds: [embed]}).catch(() => undefined);
    }
}