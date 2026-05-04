import {Kazagumo, type KazagumoPlayer} from "kazagumo";
import type {Laffey} from "../Laffey.js";
import {Connectors} from "shoukaku";
import fs from "node:fs";
import * as path from "node:path";
import type {PlayerEvent} from "../events/player/playerEvent.js";
import {Logger} from "../utils/logger.js";
import type {PlayerRateLimit} from "../events/player/playerException.js";

export class PlayerService extends Kazagumo {
    constructor(public readonly client: Laffey) {
        super({
            defaultSearchEngine: "youtube",
            send: (guildId, payload) => client.guilds.cache.get(guildId)?.shard.send(payload),
        }, new Connectors.DiscordJS(client), [{
            name: "Testing",
            url: "localhost:5050",
            auth: "REMOVED"
        }]);
    }

    public async prepare() {
        await this.listenEvents();
    }

    public async listenEvents() {
        const basePath = path.join("src", "events", "player");
        const events = fs.readdirSync(basePath);
        for (const event of events) {
            if (event.startsWith("playerEvent")) continue;
            const eventPath = path.join(process.cwd(), basePath, event);
            const modUrl = `file://${eventPath}?t=${Date.now()}`;
            const mod = await import(modUrl);
            const ev = new mod.default(this) as PlayerEvent;
            Logger.debug(`Loaded ${ev.name} ${ev.type} event`, 'Kazagumo');
            if (ev.once) {
                if (ev.type === "shoukaku") this.shoukaku.once(ev.name as any, (...args: any[]) => ev.execute(...args));
                else this.once(ev.name as any, (...args: any[]) => ev.execute(...args));
            } else {
                if (ev.type === "shoukaku") this.shoukaku.on(ev.name as any, (...args: any[]) => ev.execute(...args));
                else this.on(ev.name as any, (...args: any[]) => ev.execute(...args));
            }
        }
        Logger.log(`Loaded ${events.length} events`, 'Kazagumo');
    }

    public static isPlayerRateLimited(player: KazagumoPlayer): boolean {
        const now = Date.now();
        const rateLimit = player.data.get("ratelimit.data") as PlayerRateLimit | undefined;

        if (!rateLimit?.blockedUntil) return false;

        if (now >= rateLimit.blockedUntil) {
            player.data.delete("ratelimit.data");
            return false;
        }

        return true;
    }

    public static registerPlayerTrigger(player: KazagumoPlayer): boolean {
        const now = Date.now();
        const rateLimit = player.data.get("ratelimit.data") as PlayerRateLimit | undefined;

        if (rateLimit?.blockedUntil) {
            if (now < rateLimit.blockedUntil) return true;
            player.data.delete("ratelimit.data");
        }

        const fresh = player.data.get("ratelimit.data") as PlayerRateLimit | undefined;
        if (!fresh) {
            player.data.set("ratelimit.data", {windowStart: now, count: 1});
            return false;
        }

        if (now - fresh.windowStart >= 1000) {
            player.data.set("ratelimit.data", {windowStart: now, count: 1});
            return false;
        }

        const newCount = fresh.count + 1;

        if (newCount >= 5) {
            player.data.set("ratelimit.data", {
                windowStart: fresh.windowStart,
                count: newCount,
                blockedUntil: now + 5000
            });
            return true;
        }

        player.data.set("ratelimit.data", {windowStart: fresh.windowStart, count: newCount});

        return false;
    }
}