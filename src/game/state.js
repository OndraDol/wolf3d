/**
 * Herní stav — zdraví, munice, score, klíče, level.
 * Odpovídá originální struktuře gametype z WL_GAME.C.
 * Bude implementováno ve Fázi 5–6.
 */

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.health = 100;
        this.lives = 3;
        this.score = 0;
        this.ammo = 8;
        this.level = 1;
        this.keys = 0;       // bitmask: 1=gold, 2=silver
        this.weapon = 1;     // 0=nůž, 1=pistole, 2=automat, 3=chain gun
        this.kills = 0;
        this.treasures = 0;
        this.secrets = 0;
    }
}
