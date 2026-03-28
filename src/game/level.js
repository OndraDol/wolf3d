/**
 * Definice levelů — tile mapy, spawn pozice, objekty.
 * Bude rozšířeno o data z originálních map ve Fázi 3.
 */

/** Level 1 — testovací mapa pro vývoj */
export const LEVELS = [
    {
        name: 'Test Level',
        width: 8,
        height: 8,
        playerStart: { x: 2.5, y: 2.5, angle: 0 },
        tiles: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 3, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        entities: [],
    },
];
