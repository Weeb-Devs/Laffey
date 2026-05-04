import * as fs from "node:fs";
import * as path from "node:path";
import type {EmbedColor} from "../builder/embedBuilder.js";
import type {ColorResolvable, EmbedFooterData} from "discord.js";
import {Logger} from "./logger.js";

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
        return ConfigHandler.getInstance().get<string>("client.token");
    }

    public static get prefix(): string | undefined {
        return ConfigHandler.getInstance().get<string>("client.prefix");
    }

    public static get isDev(): boolean {
        return ConfigHandler.getInstance().get<boolean>("is_dev") ?? false;
    }

    public static get geniusApiKey(): string | undefined {
        return ConfigHandler.getInstance().get<string>("genius.api_key");
    }

    public static get owners(): string[] {
        const owners = ConfigHandler.getInstance().get<unknown>("owners");
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
        return ConfigHandler.getInstance().get<ColorResolvable>(`embed.colors.${type}`) || defaultColor;
    }

    public static get embedFooter(): EmbedFooterData | undefined {
        const footerText = ConfigHandler.getInstance().get<string>("embed.footer.text");
        const footerIcon = ConfigHandler.getInstance().get<string>("embed.footer.icon");
        if (!footerText) return;
        let data: EmbedFooterData = {text: footerText};
        if (footerIcon) data.iconURL = footerIcon;
        return data;
    }

    public static get nodes(): unknown {
        return ConfigHandler.getInstance().get<unknown>("nodes");
    }

    public static get statuses(): string[] {
        return ConfigHandler.getInstance().get<string[]>("client.statuses") ?? [];
    }

    public static get lyricsEngine(): string | undefined {
        return ConfigHandler.getInstance().get<string>("lyrics_engine");
    }

    public static get debug(): boolean | string | undefined {
        return ConfigHandler.getInstance().get<unknown>("debug") as boolean | string | undefined;
    }

    private get<T>(pathKey: string): T | undefined {
        const envValue = this.readEnv(pathKey);
        if (envValue !== undefined) return envValue as T;

        const configValue = this.readConfig(pathKey);
        if (configValue !== undefined) return configValue as T;

        return undefined;
    }

    private readEnv(pathKey: string): unknown {
        const raw = process.env[pathKey] ?? process.env[pathKey.toUpperCase()] ?? process.env[pathKey.toLowerCase()];
        if (raw === undefined) return undefined;
        return this.parseEnvValue(raw);
    }

    private parseEnvValue(raw: string): unknown {
        const trimmed = raw.trim();
        if (trimmed.length === 0) return "";

        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            try {
                return JSON.parse(trimmed);
            } catch {
                return raw;
            }
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
