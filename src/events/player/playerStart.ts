import {PlayerEvent} from "./playerEvent.js";
import type {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer, KazagumoTrack} from "kazagumo";
import {TextChannel} from "discord.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";

export default class playerStart extends PlayerEvent {
    constructor(player: PlayerService) {
        super(player, 'playerStart', 'kazagumo');
    }

    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        if (player.data.get('empty.timeout')) clearTimeout(player.data.get('empty.timeout'));
        if (!player.textId) return;
        const channel = this.player.client.channels.cache.get(player.textId);
        if (!channel || !(channel instanceof TextChannel)) return;

        const playEmbed = new EmbedBuilder(undefined, "default", true)
            .setAuthor({name: "Now Playing"})
            .setDescription(`${track ? `[${track.title}](${track.uri}) [${track.requester}]` : 'Unknown'}`);
        const msg = await channel.send({embeds: [playEmbed]}).catch(() => undefined);
        player.data.set('message', msg);
    }
}