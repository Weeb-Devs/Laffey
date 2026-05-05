import type {Laffey} from "../Laffey.js";
import {
    ChatInputCommandInteraction,
    EmbedBuilder, type GuildMember,
    Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} from "discord.js";
import type {InteractionAdapter} from "../adapter/InteractionAdapter.js";
import type {CommandResponse, SearchResponse} from "../commands/commandResponse.js";
import {ActionRowBuilder} from "@discordjs/builders";
import type {KazagumoTrack} from "kazagumo";
import {Logger} from "../utils/logger.js";

export class SearchService {
    constructor(private readonly client: Laffey) {
    }

    public async handle(ctx: Message | ChatInputCommandInteraction, interaction: InteractionAdapter, response: CommandResponse) {
        const data = response.data as SearchResponse;
        const tracks = data.tracks;

        const embed = new EmbedBuilder()
            .setTitle(`Search results for ${data.query}`);

        const selectComponent = new StringSelectMenuBuilder()
            .setCustomId('search_select')
            .setPlaceholder('Select a track')
            .addOptions(tracks.slice(0, 25).map((track, index) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(track.title)
                    .setValue(index.toString())
                    .setDescription(`${track.author ? `${track.author} ` : ''}${track.length ? ` [${new Date(track.length).toISOString().slice(11, 19)}]` : ''}`)
            }))
        const actionRow = new ActionRowBuilder().addComponents(selectComponent);

        let msg: Message | undefined;
        if (ctx instanceof ChatInputCommandInteraction) {
            msg = await ctx.editReply({embeds: [embed], components: [actionRow.toJSON()]});
        } else if (ctx instanceof Message) {
            msg = await ctx.reply({embeds: [embed], components: [actionRow.toJSON()]});
        }

        if (!msg) return;
        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.customId === 'search_select' && i.user.id === interaction.user!.id,
            time: 60 * 1000
        });

        collector.on('collect', async (i) => {
            if (!i.isStringSelectMenu()) return;
            const target = Number(i.values[0]);
            const targetTrack = tracks[target];
            if (!targetTrack) return;

            await i.deferUpdate();
            const error = await this.play(interaction, targetTrack);
            (actionRow.components[0] as StringSelectMenuBuilder).setPlaceholder(targetTrack.title).setDisabled(true);
            if (error) embed.setTitle(error).setColor('Red');
            else embed.setTitle(`Added track to player`).setColor('Green');

            await i.editReply({embeds: [embed], components: [actionRow.toJSON()]});
            collector.stop('done');
        });

        collector.on('end', (_, reason) => {
            if (!msg || reason === "done") return;
            (actionRow.components[0] as StringSelectMenuBuilder).setDisabled(true);
            msg.edit({embeds: [embed], components: [actionRow.toJSON()]}).catch(() => void 0);
        })
    }

    private async play(interaction: InteractionAdapter, track: KazagumoTrack) {
        if (!interaction.member) return;
        const member = interaction.member as GuildMember;

        let player = this.client.player.getPlayer(member.guild.id);
        const {channel} = member.voice;
        if (!channel) return 'You are not in a voice channel';

        if (!player) player = await this.client.player.createPlayer({
            guildId: member.guild.id,
            voiceId: channel.id,
            textId: interaction.channelId!,
            deaf: true
        }).catch((e) => {
            Logger.errorStack(`Something went wrong when creating player ${member.guild.id}`, 'SearchService', e);
            return undefined;
        });
        if (!player) return 'Failed to create player';
        const queue = (player.queue.current ? [player.queue.current] : []).concat([...player.queue]).filter(x => !!x);
        if (queue.some(a => a?.identifier === track.identifier)) return 'The song is already queued';

        player.queue.add(track);
        if (!player.playing && !player.paused) await player.play();
    }
}