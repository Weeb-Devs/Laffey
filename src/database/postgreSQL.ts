import {Pool} from "pg";
import {ConfigHandler} from "../utils/config.js";
import type {IDatabase} from "./IDatabase.js";
import {Logger} from "../utils/logger.js";
import {decodeTrack, encodeTrack, type IPlayer} from "./IPlayer.js";
import type {FilterOptions} from "shoukaku";
import {KazagumoTrack} from "kazagumo";

export class PostgreSQL implements IDatabase {
    private pool: Pool;

    constructor() {
        const pgConfig = ConfigHandler.databasePostgresql;
        if (!pgConfig) throw new Error('PostgresSQL config not found');

        this.pool = new Pool({
            host: pgConfig.host,
            port: pgConfig.port,
            user: pgConfig.user,
            database: pgConfig.database,
            password: pgConfig.password,
        });
    }

    async connect(): Promise<void> {
        await this.pool.connect();
        const database = await this.pool.query('SELECT current_database()');
        Logger.log(`Connected to postgresSQL: ${database.rows[0]?.current_database}`, 'PostgresSQL');
    }

    async close(): Promise<void> {
        await this.pool.end();
        Logger.log('Disconnected from postgresSQL', 'PostgresSQL');
    }

    async prepare(): Promise<void> {
        const queries = [
            // migration 01
            `
                CREATE TABLE IF NOT EXISTS players
                (
                    guild_id     BIGINT PRIMARY KEY,
                    voice_id     BIGINT      NOT NULL,
                    text_id      BIGINT,
                    volume       INT         NOT NULL,
                    loop         VARCHAR(20) NOT NULL,
                    _24h         BOOLEAN     NOT NULL,
                    filters      JSONB,
                    current_song JSONB
                );

                CREATE TABLE IF NOT EXISTS player_queue
                (
                    guild_id BIGINT NOT NULL,
                    data     JSONB  NOT NULL
                )
            `
        ]

        for (const query of queries) await this.pool.query(query);

        Logger.log('Prepared postgresSQL database', 'PostgresSQL');
    }

    async getPlayers(): Promise<IPlayer[]> {
        const playersResult = await this.pool.query('SELECT * FROM players');
        if (playersResult.rows.length === 0) return [];

        const guildIds = playersResult.rows.map(row => row.guild_id);
        const queuesResult = await this.pool.query('SELECT * FROM player_queue WHERE guild_id = ANY($1)', [guildIds]);

        const queueMap = new Map<string, any[]>();
        for (const row of queuesResult.rows) {
            const guildId = row.guild_id.toString();
            const existing = queueMap.get(guildId);
            if (existing) existing.push(row);
            else queueMap.set(guildId, [row]);
        }

        return playersResult.rows.map(row => this.mapPlayerRow(row, queueMap.get(row.guild_id.toString()) ?? []));
    }

    async getPlayer(guildId: string): Promise<IPlayer | undefined> {
        const playerResult = await this.pool.query('SELECT * FROM players WHERE guild_id = $1', [guildId]);
        const row = playerResult.rows[0];
        if (!row) return undefined;

        const queueResult = await this.pool.query('SELECT * FROM player_queue WHERE guild_id = $1', [guildId]);

        return this.mapPlayerRow(row, queueResult.rows);
    }

    async setPlayer(guildId: string, player: IPlayer): Promise<void> {
        const client = await this.pool.connect();
        await client.query('BEGIN');
        try {

            await client.query(`
                INSERT INTO players (guild_id,
                                     volume,
                                     loop,
                                     voice_id,
                                     text_id,
                                     _24h,
                                     filters,
                                     current_song)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT(guild_id) DO UPDATE SET volume       = excluded.volume,
                                                    loop         = excluded.loop,
                                                    voice_id     = excluded.voice_id,
                                                    text_id      = excluded.text_id,
                                                    _24h         = excluded._24h,
                                                    filters      = excluded.filters,
                                                    current_song = excluded.current_song
            `, [guildId, player.volume, player.loop, player.voiceId, player.textId ?? null, player._24h, player.filters ?? null, player.currentSong ? decodeTrack(player.currentSong) : null]);
            await client.query('DELETE FROM player_queue WHERE guild_id = $1', [guildId]);
            for (const track of player.queue) {
                await this.pool.query(`
                    INSERT INTO player_queue (guild_id, data)
                    VALUES ($1, $2)`, [guildId, decodeTrack(track)]);
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            Logger.errorStack(`Failed to set player ${guildId}: ${err instanceof Error ? err.message : String(err)}`, 'PostgresSQL', err as Error);
        } finally {
            client.release();
        }
    }

    async deletePlayer(guildId: string): Promise<void> {
        const client = await this.pool.connect();
        await client.query('BEGIN');
        try {
            await client.query('DELETE FROM players WHERE guild_id = $1', [guildId]);
            await client.query('DELETE FROM player_queue WHERE guild_id = $1', [guildId]);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            Logger.errorStack(`Failed to delete player ${guildId}: ${err instanceof Error ? err.message : String(err)}`, 'PostgresSQL', err as Error);
        } finally {
            client.release();
        }
    }

    private mapPlayerRow(
        row: any,
        queueRows: any[]
    ): IPlayer {
        return {
            guildId: row.guild_id.toString(),
            voiceId: row.voice_id?.toString(),
            textId: row.text_id?.toString(),
            volume: row.volume,
            loop: row.loop,
            _24h: row._24h,
            filters: row.filters,
            currentSong: row.current_song ? encodeTrack(row.current_song) : undefined,
            queue: queueRows.map(x => encodeTrack(x.data))
        };
    }
}

interface player {
    guild_id: string;
    volume: number;
    loop: string;
    voice_id: string | null;
    text_id: string | null;
    _24h: number;
    filters: FilterOptions | null;
    current_song: KazagumoTrack | null;
}

interface playerQueue {
    guild_id: string;
    data: KazagumoTrack;
}