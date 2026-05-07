import type {IPlayer} from "./IPlayer.js";

export interface IDatabase {
    connect(): Promise<void>;

    close(): Promise<void>;

    prepare(): Promise<void>;

    getPlayers(): Promise<IPlayer[]>;

    getPlayer(guildId: string): Promise<IPlayer | undefined>;

    setPlayer(guildId: string, player: IPlayer): Promise<void>;

    deletePlayer(guildId: string): Promise<void>;
}