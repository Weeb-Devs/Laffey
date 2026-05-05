import {ConfigHandler} from "../utils/config.js";
import type {IDatabase} from "../database/IDatabase.js";
import {SQLite} from "../database/sqlite.js";
import {PostgreSQL} from "../database/postgreSQL.js";
import {Logger} from "../utils/logger.js";

export class DatabaseService {
    public db: IDatabase;

    constructor() {
        switch (ConfigHandler.databaseType || "sqlite") {
            case "sqlite":
                this.db = new SQLite();
                break;
            case "postgres":
                this.db = new PostgreSQL();
                break;
            default:
                Logger.error('Invalid database type configured, no database will be initialized', 'Database');
                process.exit(1);
        }
    }

    async prepare() {
        await this.db.connect();
        await this.db.prepare();
    }
}