import * as fs from "node:fs";
import * as path from "node:path";
import type {EmbedColor} from "../builder/embedBuilder.js";
import type {ColorResolvable, EmbedFooterData} from "discord.js";
import {Logger} from "./logger.js";
import type {NodeOption} from "shoukaku";

type ConfigObject = Record<string, unknown>;

const isRecord = (value: unknown): value is ConfigObject => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

const loadConfigFile = (): ConfigObject => {
    const configPath = path.join(process.cwd(), "config.json");
    if (!fs.existsSync(configPath)) return {};

    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (isRecord(parsed)) Logger.log(`Loaded config.json`, 'Config');
        return isRecord(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

export class ConfigHandler {
    private readonly config: ConfigObject;
    private static instance: ConfigHandler;

    constructor() {
        this.config = loadConfigFile();
    }

    private static getInstance(): ConfigHandler {
        if (!ConfigHandler.instance) {
            ConfigHandler.instance = new ConfigHandler();
        }
        return ConfigHandler.instance;
    }

    public static get token(): string | undefined {
        return ConfigHandler.getInstance().get<string>("client.token", "string");
    }

    public static get prefix(): string | undefined {
        return ConfigHandler.getInstance().get<string>("client.prefix", "string");
    }

    public static get clientId(): string | undefined {
        return ConfigHandler.getInstance().get<string>("client.id", "string");
    }

    public static get isDev(): boolean {
        return ConfigHandler.getInstance().get<boolean>("is_dev", "boolean") ?? false;
    }

    public static get geniusApiKey(): string | undefined {
        return ConfigHandler.getInstance().get<string>("genius.api_key", "string");
    }

    public static get registerSlashCommand(): boolean {
        return ConfigHandler.getInstance().get<boolean>("slash.register", "boolean") ?? false;
    }

    public static get registerSlashCommandGuildId(): string | undefined {
        return ConfigHandler.getInstance().get<string>("slash.guild_id", "string");
    }

    public static get playerEmbedMode(): 'edit' | 'replace' {
        const mode = ConfigHandler.getInstance().get<string>("player.embed_mode", "string");
        if (mode && mode != "replace" && mode != "edit") Logger.warn(`Invalid player.embed_mode "${mode}" in config, defaulting to "replace"`, 'Config');
        return (mode === "edit" ? "edit" : "replace");
    }

    public static get owners(): string[] {
        const owners = ConfigHandler.getInstance().get<unknown>("owners", "array");
        if (!owners) return [];
        if (Array.isArray(owners)) return owners.map(String);
        if (typeof owners === "string") {
            return owners.split(",").map((x) => x.trim()).filter(Boolean);
        }
        return [];
    }

    public static getEmbedColor(type: EmbedColor): ColorResolvable {
        let defaultColor: ColorResolvable = '#6b92f3';
        if (type === "success") defaultColor = '#43b581';
        if (type === "error") defaultColor = '#f87171';
        if (type === "warning") defaultColor = '#fbbf24';
        return ConfigHandler.getInstance().get<ColorResolvable>(`embed.colors.${type}`, "string") || defaultColor;
    }

    public static get embedFooter(): EmbedFooterData | undefined {
        const footerText = ConfigHandler.getInstance().get<string>("embed.footer.text", "string");
        const footerIcon = ConfigHandler.getInstance().get<string>("embed.footer.icon_url", "string");
        if (!footerText) return;
        let data: EmbedFooterData = {text: footerText};
        if (footerIcon) data.iconURL = footerIcon;
        return data;
    }

    public static get nodes(): NodeOption[] {
        return ConfigHandler.getInstance().get<NodeOption[]>("player.nodes", "array") || [];
    }

    public static get playerDefaultSearch(): string | undefined {
        return ConfigHandler.getInstance().get<string>("player.default_search", "string");
    }

    public static get statuses(): string[] {
        return ConfigHandler.getInstance().get<string[]>("client.statuses", "array") ?? [];
    }

    public static get databaseType(): string | undefined {
        return ConfigHandler.getInstance().get<string>("database.type", "string");
    }

    public static get databaseSqlitePath(): string {
        return ConfigHandler.getInstance().get<string>("database.sqlite.path", "string") ?? "./laffey.db";
    }

    public static get databasePostgresql(): {
        host: string;
        port: number;
        user?: string | undefined;
        password?: string | undefined;
        database?: string | undefined
    } {
        const host = ConfigHandler.getInstance().get<string>("database.postgres.host", "string") ?? "localhost";
        const port = ConfigHandler.getInstance().get<number>("database.postgres.port", "number") ?? 5432;
        const user = ConfigHandler.getInstance().get<string>("database.postgres.user", "string");
        const password = ConfigHandler.getInstance().get<string>("database.postgres.password", "string");
        const database = ConfigHandler.getInstance().get<string>("database.postgres.database", "string");
        return {host, port, user, password, database};
    }

    public static get databaseMysql(): {
        host: string;
        port: number;
        user?: string | undefined;
        password?: string | undefined;
        database?: string | undefined
    } {
        const host = ConfigHandler.getInstance().get<string>("database.mysql.host", "string") ?? "localhost";
        const port = ConfigHandler.getInstance().get<number>("database.mysql.port", "number") ?? 3306;
        const user = ConfigHandler.getInstance().get<string>("database.mysql.user", "string");
        const password = ConfigHandler.getInstance().get<string>("database.mysql.password", "string");
        const database = ConfigHandler.getInstance().get<string>("database.mysql.database", "string");
        return {host, port, user, password, database};
    }

    private get<T>(pathKey: string, expectedType?: string): T | undefined {
        const envValue = this.readEnv(pathKey, expectedType);
        if (envValue !== undefined) {
            this.validateType(envValue, pathKey, expectedType);
            return envValue as T;
        }

        const configValue = this.readConfig(pathKey);
        if (configValue !== undefined) {
            this.validateType(configValue, pathKey, expectedType);
            return configValue as T;
        }

        return undefined;
    }

    private validateType(value: unknown, pathKey: string, expectedType?: string): void {
        if (!expectedType) return;

        if (expectedType === "boolean" && typeof value !== "boolean") {
            throw new Error(`Config key "${pathKey}" expects boolean but got ${typeof value}: ${value}`);
        }
        if (expectedType === "number" && typeof value !== "number") {
            throw new Error(`Config key "${pathKey}" expects number but got ${typeof value}: ${value}`);
        }
        if (expectedType === "string" && typeof value !== "string") {
            throw new Error(`Config key "${pathKey}" expects string but got ${typeof value}: ${value}`);
        }
        if (expectedType === "object" && (typeof value !== "object" || value === null)) {
            throw new Error(`Config key "${pathKey}" expects object but got ${typeof value}: ${value}`);
        }
        if (expectedType === "array" && !Array.isArray(value)) {
            throw new Error(`Config key "${pathKey}" expects array but got ${typeof value}: ${value}`);
        }
    }

    private readEnv(pathKey: string, expectedType?: string): unknown {
        const raw = process.env[pathKey] ?? process.env[pathKey.toUpperCase()] ?? process.env[pathKey.toLowerCase()];
        if (raw === undefined) return undefined;
        return this.parseEnvValue(raw, expectedType);
    }

    private parseEnvValue(raw: string, expectedType?: string): unknown {
        const trimmed = raw.trim();
        if (trimmed.length === 0) return "";

        if (expectedType === "boolean") {
            if (trimmed.toLowerCase() === "true") return true;
            if (trimmed.toLowerCase() === "false") return false;
            return trimmed;
        }

        if (expectedType === "number") {
            const num = Number(trimmed);
            if (!Number.isNaN(num)) return num;
            return trimmed;
        }

        if (expectedType === "array" || expectedType === "object") {
            if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
                try {
                    return JSON.parse(trimmed);
                } catch {
                    return trimmed;
                }
            }
            return trimmed;
        }

        return raw;
    }

    private readConfig(pathKey: string): unknown {
        return this.getByPath(this.config, pathKey);
    }

    private getByPath(root: unknown, pathKey: string): unknown {
        const segments = pathKey.split(".").map((segment) => segment.trim()).filter(Boolean);
        let current: unknown = root;

        for (const segment of segments) {
            if (Array.isArray(current)) {
                const index = Number(segment);
                if (!Number.isInteger(index) || index < 0 || index >= current.length) return undefined;
                current = current[index];
                continue;
            }

            if (!isRecord(current)) return undefined;
            const direct = current[segment];
            if (direct !== undefined) {
                current = direct;
                continue;
            }

            const lowerSegment = segment.toLowerCase();
            const matchKey = Object.keys(current).find((key) => key.toLowerCase() === lowerSegment);
            if (!matchKey) return undefined;
            current = current[matchKey];
        }

        return current;
    }
}
