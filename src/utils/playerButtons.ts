import {ButtonBuilder} from "@discordjs/builders";
import {ButtonStyle} from "discord.js";

export class PlayerButtons {
    static playButton(pause = false, disabled = false) {
        return this.button(ButtonStyle.Primary, pause ? 'pause' : 'play', pause ? '⏸️' : '▶️', disabled);
    }

    static loopButton(type: 'none' | 'queue' | 'track', disabled = false) {
        switch (type) {
            case 'none':
                return this.loopOffButton(disabled);
            case 'queue':
                return this.loopQueueButton(disabled);
            case 'track':
                return this.loopTrackButton(disabled);
        }
    }

    private static loopOffButton(disabled = false) {
        return this.button(ButtonStyle.Secondary, 'loop', '➡️', disabled);
    }

    private static loopQueueButton(disabled = false) {
        return this.button(ButtonStyle.Secondary, 'loop_queue', '🔁', disabled);
    }

    private static loopTrackButton(disabled = false) {
        return this.button(ButtonStyle.Secondary, 'loop_track', '🔂', disabled);
    }

    static previousButton(disabled = false) {
        return this.button(ButtonStyle.Secondary, 'previous', '⏮️', disabled);
    }

    static skipButton(disabled = false) {
        return this.button(ButtonStyle.Secondary, 'skip', '⏭️', disabled);
    }

    static stopButton(disabled = false) {
        return this.button(ButtonStyle.Danger, 'stop', '⏹️', disabled);
    }

    static favoriteButton(disabled = false) {
        return this.button(ButtonStyle.Success, 'favorite', '❤️', disabled);
    }

    static volumeUp(disabled = false) {
        return this.button(ButtonStyle.Secondary, 'volume_up', '🔊', disabled);
    }

    static volumeDown(disabled = false) {
        return this.button(ButtonStyle.Secondary, 'volume_down', '🔉', disabled);
    }

    static volumeMute(disabled = false) {
        return this.button(ButtonStyle.Danger, 'mute', '🔇', disabled);
    }

    static volumeUnmute(disabled = false) {
        return this.button(ButtonStyle.Primary, 'unmute', '🔈', disabled);
    }

    private static button(style: ButtonStyle, customId: string, emoji: string, disabled = false) {
        return new ButtonBuilder()
            .setCustomId(customId)
            .setEmoji({name: emoji})
            .setStyle(style)
            .setDisabled(disabled);
    }
}