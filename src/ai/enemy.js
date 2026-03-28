/**
 * Enemy AI — stavový automat, pathfinding, detekce hráče.
 *
 * Stavy (z originálu): STAND → PATROL → CHASE → ATTACK → PAIN → DEATH
 * Pathfinding: greedy best-first (jako originál, ne A*).
 * Detekce: line-of-sight přes DDA + area connectivity.
 *
 * Bude implementováno ve Fázi 4.
 */

export const EnemyState = {
    STAND: 'stand',
    PATROL: 'patrol',
    CHASE: 'chase',
    ATTACK: 'attack',
    PAIN: 'pain',
    DEATH: 'death',
};

export class Enemy {
    constructor(x, y, type = 'guard') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.state = EnemyState.STAND;
        this.health = 25;
        this.speed = 1.5;
        this.angle = 0;
    }

    update(dt, player, map) {
        // TODO: implementovat stavový automat
    }
}
