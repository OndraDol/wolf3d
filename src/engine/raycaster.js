/**
 * DDA Raycaster — jádro renderovacího enginu.
 *
 * Algoritmus:
 * Pro každý sloupec obrazovky vyšle paprsek z pozice kamery.
 * Paprsek prochází mapovou mřížkou (DDA stepping) dokud nenarazí na stěnu.
 * Výsledek: vzdálenost, typ stěny, pozice zásahu (pro texturu), orientace (N/S vs E/W).
 *
 * Implementace bude následovat v další fázi.
 */

/** Výsledek jednoho paprsku */
export class RayHit {
    constructor() {
        this.distance = 0;      // Perpendicular distance (ne Euclidean — kvůli fish-eye korekci)
        this.tileType = 0;      // Typ stěny (1–63)
        this.textureX = 0;      // Pozice zásahu na stěně (0.0–1.0) pro texture mapping
        this.side = 0;          // 0 = N/S (vertical grid line), 1 = E/W (horizontal grid line)
        this.mapX = 0;          // Tile souřadnice zásahu
        this.mapY = 0;
    }
}

export class Raycaster {
    constructor(map, screenWidth, screenHeight) {
        this.map = map;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.rays = new Array(screenWidth);
        for (let i = 0; i < screenWidth; i++) {
            this.rays[i] = new RayHit();
        }
    }

    /**
     * Vyšli paprsky pro všechny sloupce obrazovky.
     * @param {Camera} camera
     * @returns {RayHit[]} pole výsledků pro každý sloupec
     */
    castRays(camera) {
        const halfFov = camera.fov / 2;

        for (let col = 0; col < this.screenWidth; col++) {
            // Úhel paprsku — od levého kraje FOV po pravý
            const screenX = (2 * col / this.screenWidth) - 1; // -1 (vlevo) až +1 (vpravo)
            const rayAngle = camera.angle + Math.atan(screenX * Math.tan(halfFov));

            this.castSingleRay(col, camera.x, camera.y, rayAngle, camera.angle);
        }

        return this.rays;
    }

    /**
     * DDA algoritmus pro jeden paprsek.
     * Bude plně implementován v další fázi.
     */
    castSingleRay(col, originX, originY, rayAngle, cameraAngle) {
        const ray = this.rays[col];
        const dirX = Math.cos(rayAngle);
        const dirY = Math.sin(rayAngle);

        // Aktuální tile
        let mapX = Math.floor(originX);
        let mapY = Math.floor(originY);

        // DDA: délka paprsku k další vertikální/horizontální grid čáře
        const deltaDistX = Math.abs(1 / dirX);
        const deltaDistY = Math.abs(1 / dirY);

        // Krok a počáteční vzdálenost k první grid čáře
        let stepX, sideDistX;
        let stepY, sideDistY;

        if (dirX < 0) {
            stepX = -1;
            sideDistX = (originX - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1 - originX) * deltaDistX;
        }

        if (dirY < 0) {
            stepY = -1;
            sideDistY = (originY - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1 - originY) * deltaDistY;
        }

        // DDA stepping
        let side = 0;
        let hit = false;

        while (!hit) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }

            const tile = this.map.getTile(mapX, mapY);
            if (tile > 0 && tile < 64) {
                hit = true;
                ray.tileType = tile;
            }
        }

        // Perpendicular distance (opravuje fish-eye)
        let perpDist;
        if (side === 0) {
            perpDist = (mapX - originX + (1 - stepX) / 2) / dirX;
        } else {
            perpDist = (mapY - originY + (1 - stepY) / 2) / dirY;
        }

        // Texture coordinate (kde na stěně paprsek zasáhl — 0.0 až 1.0)
        let wallX;
        if (side === 0) {
            wallX = originY + perpDist * dirY;
        } else {
            wallX = originX + perpDist * dirX;
        }
        wallX -= Math.floor(wallX);

        ray.distance = perpDist;
        ray.textureX = wallX;
        ray.side = side;
        ray.mapX = mapX;
        ray.mapY = mapY;
    }
}
