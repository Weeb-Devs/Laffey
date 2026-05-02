import {Kazagumo} from "kazagumo";
import type {Laffey} from "../Laffey.js";
import {Connectors} from "shoukaku";
import fs from "node:fs";
import * as path from "node:path";
import type {PlayerEvent} from "../events/player/playerEvent.js";

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
            console.log(`[PLAYER] => [EVENTS] Loaded ${ev.name} ${ev.type} event`);
            if (ev.once) {
                if (ev.type === "shoukaku") this.shoukaku.once(ev.name as any, (...args: any[]) => ev.execute(...args));
                else this.once(ev.name as any, (...args: any[]) => ev.execute(...args));
            } else {
                if (ev.type === "shoukaku") this.shoukaku.on(ev.name as any, (...args: any[]) => ev.execute(...args));
                else this.on(ev.name as any, (...args: any[]) => ev.execute(...args));
            }
        }
    }
}