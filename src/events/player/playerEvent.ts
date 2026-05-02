import type {PlayerService} from "../../service/playerService.js";

export abstract class PlayerEvent {
    constructor(protected readonly player: PlayerService, public readonly name: string, public readonly type: 'shoukaku' | 'kazagumo', public readonly once: boolean = false) {
    }

    abstract execute(...args: any): void;
}