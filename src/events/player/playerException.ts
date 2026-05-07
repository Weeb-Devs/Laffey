import {PlayerEvent} from "./playerEvent.js";
import {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer} from "kazagumo";
import type {TrackExceptionEvent} from "shoukaku";
import {EmbedBuilder} from "../../builder/embedBuilder.js";
import {TextChannel} from "discord.js";
import {Logger} from "../../utils/logger.js";

export type PlayerRateLimit = {
    windowStart: number;
    count: number;
    blockedUntil?: number;
};

export default class playerException extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerException', 'kazagumo');
    }

    execute(player: KazagumoPlayer, data: TrackExceptionEvent) {
        if (PlayerService.isPlayerRateLimited(player)) return;
        if (PlayerService.registerPlayerTrigger(player)) return;

        if (!player.textId) return;
        const channel = this.player.client.channels.cache.get(player.textId);
        if (!channel || !(channel instanceof TextChannel)) return;

        const embed = new EmbedBuilder(undefined, "error", true)
            .setTitle("Track Exception")
            .setDescription(`An error occurred while trying to play the track.`);
        channel.send({embeds: [embed]}).catch(() => undefined);
        Logger.error(`Player ${player.guildId} Exception: ${data.exception.message}`, 'Kazagumo');
    }
}