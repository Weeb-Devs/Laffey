import {PlayerEvent} from "./playerEvent.js";
import {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer, KazagumoTrack} from "kazagumo";
import {TextChannel} from "discord.js";
import {Logger} from "../../utils/logger.js";

export default class playerStart extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerStart', 'kazagumo');
    }

    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        if (PlayerService.isPlayerRateLimited(player)) return;
        this.player.client.db.db.setPlayer(player.guildId, PlayerService.buildDbPlayer(player)).catch(() => undefined);

        if (player.data.get('empty.timeout')) clearTimeout(player.data.get('empty.timeout'));
        if (!player.textId) return;
        const channel = this.player.client.channels.cache.get(player.textId);
        if (!channel || !(channel instanceof TextChannel)) return;

        const embed = await this.player.getPlayerEmbed(player, track);
        const msg = await channel.send({
            embeds: [embed],
            components: this.player.getPlayerComponents(player)
        }).catch((e) => Logger.errorStack(`Failed to send player start message: ${e instanceof Error ? e.message : String(e)}`, 'PlayerStartEvent', e as Error));
        player.data.set('message', msg);
    }
}