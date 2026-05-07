import {
    type APIInteractionGuildMember, ChatInputCommandInteraction,
    Guild, GuildMember, type Message, type User
} from "discord.js";
import type {Laffey} from "../Laffey.js";
import type {Command} from "../commands/Command.js";

export class InteractionAdapter {
    constructor(
        public readonly client: Laffey,
        public readonly interaction?: ChatInputCommandInteraction,
        public readonly message?: Message,
        public readonly commands: Command[] = []) {
    }

    public get member(): GuildMember | APIInteractionGuildMember | null | undefined {
        return this.interaction?.member || this.message?.member;
    }

    public get user(): User | undefined {
        return this.interaction?.user || this.message?.author;
    }

    public get guildId(): string | undefined {
        return this.interaction?.guildId || this.message?.guildId || undefined;
    }

    public get channelId(): string | undefined {
        return this.interaction?.channelId || this.message?.channelId || undefined;
    }

    public get guild(): Guild | undefined {
        return this.interaction?.guild || this.message?.guild || undefined;
    }

    public getString(query: string, n: number): string | undefined {
        if (this.interaction) {
            return this.interaction.options.getString(query) || undefined;
        } else if (this.message) {
            if (n < 0) {
                const index = (n * -1);
                const split = this.message.content.trim().split(/\s+/);
                return split.filter((_, i) => i >= index).join(' ') || undefined;
            }
            const args = this.message.content.trim().split(/\s+/);
            return args[n + 1] || undefined;
        }
    }

    public getBoolean(query: string, n: number): boolean | undefined {
        if (this.interaction) {
            return this.interaction.options.getBoolean(query) || undefined;
        } else if (this.message) {
            const args = this.message.content.trim().split(/\s+/);
            const arg = args[n + 1] || undefined;
            if (!arg) return undefined;
            return ["true", "yes", "enable", "enabled", "on"].includes(arg);
        }
    }

    public getInteger(query: string, n: number): number | undefined {
        if (this.interaction) {
            return this.interaction.options.getInteger(query) || undefined;
        } else if (this.message) {
            const args = this.message.content.trim().split(/\s+/);
            const num = parseInt(args[n + 1] || 'a', 10);
            return (isNaN(num) || !args[n + 1]) ? undefined : num;
        }
    }

    public getSubCommand(n: number = 0): string | undefined {
        if (this.interaction) {
            return this.interaction.options.getSubcommand();
        } else if (this.message) {
            const args = this.message.content.trim().split(/\s+/);
            return args[n + 1] || undefined;
        }
    }

    public async deferReply() {
        if (this.interaction) return this.interaction.deferReply();
    }
}