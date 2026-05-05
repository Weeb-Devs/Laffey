import {PlayerEvent} from "./playerEvent.js";
import {PlayerService} from "../../service/playerService.js";
import type {KazagumoPlayer, KazagumoTrack} from "kazagumo";
import {TextChannel, type User} from "discord.js";
import {EmbedBuilder} from "../../builder/embedBuilder.js";
import {Sharp} from "../../utils/sharp.js";

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

        const requester = track.requester as User | undefined;
        const playEmbed = new EmbedBuilder(undefined, "default", true)
            .setAuthor({name: "Now Playing"})
            .setDescription(`[${track.title}](${track.uri})${track.author ? ` - ${track.author}` : ''} [<@!${requester?.id}>]`);
        if (track.thumbnail) playEmbed.setThumbnail(track.thumbnail);

        const color = track.thumbnail ? await Sharp.getPaletteFromUrl(track.thumbnail).catch(() => undefined) : undefined;
        if (color?.length) playEmbed.setColor(color[0]!.rgb);

        if (requester) {
            playEmbed.data.footer = {text: `Requested by ${requester.tag}`};
            if (requester.avatar) playEmbed.data.footer.icon_url = `https://cdn.discordapp.com/avatars/${requester.id}/${requester.avatar}.webp`;
        }

        const msg = await channel.send({embeds: [playEmbed]}).catch(() => undefined);
        player.data.set('message', msg);
    }
}