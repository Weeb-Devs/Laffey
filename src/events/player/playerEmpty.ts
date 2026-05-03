import type {PlayerService} from "../../service/playerService.js";
import {PlayerEvent} from "./playerEvent.js";
import type {KazagumoPlayer} from "kazagumo";
import {TextChannel} from "discord.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";

export default class playerEmpty extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerEmpty', 'kazagumo');
    }

    async execute(player: KazagumoPlayer) {
        player.data.get("message")?.delete().catch(() => void 0);
        if (!player.textId) return;
        const channel = this.player.client.channels.cache.get(player.textId);
        if (!channel || !(channel instanceof TextChannel)) return;
        const is24h = (player.data.get('24h') as boolean | undefined) || false;

        const embed = new EmbedBuilder(`The queue is empty.${!is24h ? " Leaving in 2 minutes..." : ""}`, 'warning');
        await channel.send({embeds: [embed]}).catch(() => null);
        player.data.set('empty.time', new Date().getTime());

        if (is24h) return;

        const timeout = setTimeout(() => player.destroy().catch(() => void 0), 2 * 60 * 1000);
        player.data.set('empty.timeout', timeout);
    }
}