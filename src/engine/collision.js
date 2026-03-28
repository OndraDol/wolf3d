/**
 * Detekce kolizí — stěny, dveře, objekty.
 * Hlavní kolize hráče se stěnami je v camera.js (per-axis sliding).
 * Tento modul bude rozšířen o kolize nepřátel, projektilů atd.
 */

/**
 * Zkontroluj, jestli kruhový objekt (radius) koliduje se stěnami mapy.
 * @param {GameMap} map
 * @param {number} x - střed
 * @param {number} y - střed
 * @param {number} radius
 * @returns {boolean}
 */
export function circleCollidesWall(map, x, y, radius) {
    // Kontrola 4 rohů bounding boxu
    return (
        map.isWall(x - radius, y - radius) ||
        map.isWall(x + radius, y - radius) ||
        map.isWall(x - radius, y + radius) ||
        map.isWall(x + radius, y + radius)
    );
}
