import type {IDatabase} from "./IDatabase.js";
import {ConfigHandler} from "../utils/config.js";
import Database from "better-sqlite3";
import {type Database as SQDatabase} from "better-sqlite3";
import {Logger} from "../utils/logger.js";
import {type DbTrack, decodeTrack, encodeTrack, type IPlayer} from "./IPlayer.js";

export class SQLite implements IDatabase {
    private db: SQDatabase;

    constructor() {
        this.db = new Database(ConfigHandler.databaseSqlitePath, {
            fileMustExist: false,
        });
    }

    connect(): Promise<void> {
        this.db.exec("SELECT 1");
        Logger.log(`Connected to SQLite database (${this.db.name})`, "SQLite");
        return Promise.resolve();
    }

    prepare(): Promise<void> {
        const queries = [
            // migration 01
            `
                CREATE TABLE IF NOT EXISTS players
                (
                    guild_id     TEXT PRIMARY KEY,
                    voice_id     TEXT,
                    text_id      TEXT,
                    volume       INTEGER NOT NULL,
                    loop         TEXT    NOT NULL,
                    _24h         INTEGER NOT NULL,
                    filters      BLOB,
                    current_song BLOB
                );
            `,
            `
                CREATE TABLE IF NOT EXISTS player_queue
                (
                    guild_id TEXT,
                    data     BLOB NOT NULL
                );
            `
        ];

        for (const query of queries) this.db.prepare(query).run();

        Logger.log("Prepared SQLite database", "SQLite");
        return Promise.resolve();
    }

    close(): Promise<void> {
        this.db.close();
        Logger.log("Closed SQLite database", "SQLite");
        return Promise.resolve();
    }

    private fetchPlayers(guildId?: string): { player: player; queue: playerQueue[] }[] {
        const players = guildId
            ? this.db.prepare("SELECT * FROM players WHERE guild_id = ?").all(guildId)
            : this.db.prepare("SELECT * FROM players").all();

        if ((players as player[]).length === 0) return [];

        const queues = guildId
            ? this.db.prepare("SELECT * FROM player_queue WHERE guild_id = ?").all(guildId)
            : this.db.prepare("SELECT * FROM player_queue").all();

        const queueMap = new Map<string, playerQueue[]>();
        for (const queue of queues as playerQueue[]) {
            if (!queueMap.has(queue.guild_id)) queueMap.set(queue.guild_id, []);
            queueMap.get(queue.guild_id)!.push(queue);
        }

        return (players as player[]).map((player) => ({
            player,
            queue: queueMap.get(player.guild_id) || [],
        }));
    }

    async getPlayers(): Promise<IPlayer[]> {
        return this.fetchPlayers().map(({player, queue}) =>
            this.mapPlayer(player, queue)
        );
    }

    async getPlayer(guildId: string): Promise<IPlayer> {
        const result = this.fetchPlayers(guildId)[0];
        if (!result) throw new Error(`Player not found for guild ${guildId}`);

        return this.mapPlayer(result.player, result.queue);
    }

    async setPlayer(guildId: string, player: IPlayer): Promise<void> {
        const upsertPlayer = this.db.prepare(`
            INSERT INTO players (guild_id,
                                 volume,
                                 loop,
                                 voice_id,
                                 text_id,
                                 _24h,
                                 filters,
                                 current_song)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET volume       = excluded.volume,
                                                loop         = excluded.loop,
                                                voice_id     = excluded.voice_id,
                                                text_id      = excluded.text_id,
                                                _24h         = excluded._24h,
                                                filters      = excluded.filters,
                                                current_song = excluded.current_song
        `);
        const deleteQueue = this.db.prepare("DELETE FROM player_queue WHERE guild_id = ?");
        const upsertQueue = this.db.prepare(`
            INSERT INTO player_queue (guild_id, data)
            VALUES (?, ?)
        `);

        const transaction = this.db.transaction(() => {
            upsertPlayer.run(
                guildId,
                player.volume,
                player.loop,
                player.voiceId ?? null,
                player.textId ?? null,
                player._24h ? 1 : 0,
                player.filters ? this.toBlob(player.filters) : null,
                player.currentSong ? this.toBlob(decodeTrack(player.currentSong)) : null
            );
            deleteQueue.run(guildId);
            for (const track of player.queue) upsertQueue.run(guildId, this.toBlob(decodeTrack(track)));
        });

        transaction();
    }

    async deletePlayer(guildId: string): Promise<void> {
        const deletePlayer = this.db.prepare("DELETE FROM players WHERE guild_id = ?");
        const deleteQueue = this.db.prepare("DELETE FROM player_queue WHERE guild_id = ?");

        const transaction = this.db.transaction(() => {
            deletePlayer.run(guildId);
            deleteQueue.run(guildId);
        });

        transaction();
    }

    private mapPlayer(player: player, queue: playerQueue[]): IPlayer {
        const currentSong = player.current_song
            ? this.parseBlob<DbTrack>(player.current_song)
            : undefined;

        const queueData = queue.map((q => this.parseBlob<DbTrack>(q.data))).filter((q): q is DbTrack => q !== undefined);

        return {
            guildId: player.guild_id,
            voiceId: player.voice_id ?? undefined,
            textId: player.text_id ?? undefined,
            volume: player.volume,
            loop: player.loop,
            _24h: Boolean(player._24h),
            filters: player.filters ? this.parseBlob(player.filters) : undefined,
            currentSong: currentSong ? encodeTrack(currentSong) : undefined,
            queue: queueData ? queueData.map(encodeTrack) : [],
        };
    }

    private toBlob(value: unknown): Buffer | null {
        if (value === undefined || value === null) return null;
        return Buffer.from(JSON.stringify(value), "utf8");
    }

    private parseBlob<T = any>(value: Buffer | null | undefined): T | undefined {
        if (!value) return undefined;

        try {
            return JSON.parse(value.toString("utf8")) as T;
        } catch {
            return undefined;
        }
    }
}

interface player {
    guild_id: string;
    volume: number;
    loop: string;
    voice_id: string;
    text_id: string | null;
    _24h: number;
    filters: Buffer | null;
    current_song: Buffer | null;
}

interface playerQueue {
    guild_id: string;
    data: Buffer;
}