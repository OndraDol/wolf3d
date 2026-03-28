/**
 * Herní mapa — 2D pole tile hodnot.
 *
 * Tile hodnoty:
 *   0        = prázdné (průchozí)
 *   1–63     = typy stěn (různé textury)
 *   64–99    = dveře (budoucí)
 *   100+     = speciální objekty (budoucí)
 */

// Testovací mapa 8×8 — jednoduché místnosti pro vývoj raycasting enginu
const TEST_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];

export class GameMap {
    constructor(data = TEST_MAP) {
        this.tiles = data;
        this.height = data.length;
        this.width = data[0].length;
    }

    /** Vrať tile hodnotu na [x,y] (tile souřadnice). Mimo mapu = stěna. */
    getTile(x, y) {
        const tx = Math.floor(x);
        const ty = Math.floor(y);
        if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return 1;
        return this.tiles[ty][tx];
    }

    /** Je na pozici [x,y] stěna? (tile > 0 a < 64) */
    isWall(x, y) {
        const tile = this.getTile(x, y);
        return tile > 0 && tile < 64;
    }
}
