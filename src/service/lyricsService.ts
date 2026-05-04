import {Client, Song} from "genius-lyrics";
import {Logger} from "../utils/logger.js";
import {EmbedBuilder} from "../builder/embedBuilder.js";
import {ChatInputCommandInteraction, Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import type {InteractionAdapter} from "../adapter/InteractionAdapter.js";
import type {CommandResponse} from "../commands/commandResponse.js";
import {ActionRowBuilder} from "@discordjs/builders";
import {Pagination} from "../utils/pagination.js";
import {Sharp} from "../utils/sharp.js";
import {ConfigHandler} from "../utils/config.js";

export class LyricsService {
    private client = new Client(ConfigHandler.geniusApiKey);
    private static instance: LyricsService;

    static getInstance(): LyricsService {
        if (!LyricsService.instance) LyricsService.instance = new LyricsService();
        return LyricsService.instance;
    }

    async search(query: string): Promise<Song[]> {
        return this.client.songs.search(query);
    }

    async getLyrics(song: Song): Promise<string | null> {
        try {
            return await song.lyrics();
        } catch (error) {
            Logger.errorStack(`Error fetching lyrics for ${song.title} - ${song.artist}`, 'Lyrics', error as Error);
            return null;
        }
    }

    static async getEmbed(song: Song, lyrics: string): Promise<EmbedBuilder[]> {
        const palette = (song.thumbnail || song.image) ? await Sharp.getPaletteFromUrl(song.thumbnail ?? song.image) : undefined;
        const splitLyrics = this.splitLyrics(lyrics, 2048);
        const embeds: EmbedBuilder[] = [];
        for (const lyrics of splitLyrics) {
            const embed = new EmbedBuilder(undefined, "default", true)
                .setAuthor({name: song.title, iconURL: song.thumbnail, url: song.url})
                .setThumbnail(song.image || song.thumbnail)
                .setDescription(lyrics);
            if (palette?.length) embed.setColor(palette[0]!.rgb)
            embeds.push(embed);
        }
        return embeds;
    }

    async handle(ctx: Message | ChatInputCommandInteraction, interaction: InteractionAdapter, response: CommandResponse) {
        const data = response.data as Song[];

        const embed = new EmbedBuilder()
            .setTitle(`Found ${data.length} results`);

        const selectComponent = new StringSelectMenuBuilder()
            .setCustomId('lyrics_select')
            .setPlaceholder('Select a track')
            .addOptions(data.slice(0, 25).map((track, index) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel((track.fullTitle || track.title).slice(0, 100))
                    .setValue(index.toString())
                    .setDescription(`${track.artist.name} - ${track.album?.name || 'Unknown Album'}`)
            }))
        const actionRow = new ActionRowBuilder().addComponents(selectComponent);

        let msg: Message | undefined;
        if (ctx instanceof ChatInputCommandInteraction) {
            await ctx.reply({embeds: [embed], components: [actionRow.toJSON()]});
            msg = await ctx.fetchReply().catch(() => undefined) as Message | undefined;
        } else if (ctx instanceof Message) {
            msg = await ctx.reply({embeds: [embed], components: [actionRow.toJSON()]});
        }
        if (!msg) return;
        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.customId === 'lyrics_select' && i.user.id === interaction.user!.id,
            time: 60 * 1000
        });
        collector.on('collect', async (i) => {
            if (!i.isStringSelectMenu()) return;
            const target = Number(i.values[0]);
            const song = data[target];
            if (!song) return i.reply({embeds: [new EmbedBuilder(`Invalid selection`, 'error')], ephemeral: true});
            await i.deferUpdate();
            const lyrics = await this.getLyrics(song);
            if (!lyrics) return i.editReply({embeds: [new EmbedBuilder(`No lyrics found for ${song.title}`, 'error')]});
            const embeds = await LyricsService.getEmbed(song, lyrics);
            const pagination = new Pagination(i.message, interaction, embeds);
            await pagination.start().catch(() => i.editReply({embeds: [new EmbedBuilder(`Failed to display lyrics`, 'error')]}));
        });
        collector.on('end', () => {
            if (!msg) return;
            (actionRow.components[0] as StringSelectMenuBuilder).setDisabled(true);
            msg.edit({
                embeds: [new EmbedBuilder(`Selection expired`, 'error')],
                components: [actionRow.toJSON()]
            }).catch(() => void 0);
        })
    }

    static splitLyrics(lyrics: string, maxLen: number) {
        const chunks = [];
        let start = 0;
        while (start < lyrics.length) {
            let end = Math.min(start + maxLen, lyrics.length);
            let lastNl = lyrics.lastIndexOf('\n', end - 1);
            if (lastNl < start) {
                chunks.push(lyrics.slice(start, end));
                start = end;
            } else {
                chunks.push(lyrics.slice(start, lastNl + 1));
                start = lastNl + 1;
            }
        }
        return chunks;
    }
}