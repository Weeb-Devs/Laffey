import {KazagumoTrack, type RawTrack} from "kazagumo";
import type {FilterOptions} from "shoukaku";

export type DbTrack = RawTrack & { requester: unknown };

export interface IPlayer {
    guildId: string;
    voiceId: string | undefined;
    textId: string | undefined;
    volume: number;
    loop: string;
    _24h: boolean;
    filters: FilterOptions | undefined;
    currentSong: KazagumoTrack | undefined;
    queue: KazagumoTrack[];
}

export function decodeTrack(track: KazagumoTrack): DbTrack {
    return {...track.getRaw(), requester: track.requester};
}

export function encodeTrack(track: DbTrack): KazagumoTrack {
    return new KazagumoTrack(track._raw, track.requester);
}