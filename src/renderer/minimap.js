import { Screen } from './screen.js';

const TILE_SIZE = 12;
const MARGIN = 12;
const PLAYER_SIZE = 4;

const COLORS = {
    panel: Screen.rgb(18, 18, 18),
    border: Screen.rgb(220, 220, 220),
    empty: Screen.rgb(42, 42, 42),
    player: Screen.rgb(72, 255, 124),
    direction: Screen.rgb(255, 240, 120),
    fov: Screen.rgb(255, 138, 64),
    ray: Screen.rgb(88, 188, 255),
    stand: Screen.rgb(214, 214, 214),
    patrol: Screen.rgb(96, 224, 255),
    chase: Screen.rgb(255, 92, 92),
    patrolPath: Screen.rgb(88, 120, 150),
    exit: Screen.rgb(255, 216, 92),
    ammo: Screen.rgb(96, 180, 255),
    medkit: Screen.rgb(110, 255, 146),
    goldKey: Screen.rgb(255, 204, 68),
    silverKey: Screen.rgb(206, 222, 246),
    shotgun: Screen.rgb(196, 142, 84),
    weapon: Screen.rgb(216, 164, 92),
    officer: Screen.rgb(106, 188, 255),
    commander: Screen.rgb(255, 132, 84),
    dog: Screen.rgb(182, 132, 84),
    projectile: Screen.rgb(72, 244, 255),
    armor: Screen.rgb(86, 146, 255),
    treasure: Screen.rgb(255, 222, 92),
};

const DEBUG_RAY_STEP = 32;

function fillRect(screen, x, y, width, height, color) {
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(screen.width, Math.ceil(x + width));
    const endY = Math.min(screen.height, Math.ceil(y + height));
    const pixels = screen.pixels;
    const screenWidth = screen.width;

    for (let py = startY; py < endY; py++) {
        const rowOffset = py * screenWidth;
        for (let px = startX; px < endX; px++) {
            pixels[rowOffset + px] = color;
        }
    }
}

function drawLine(screen, x0, y0, x1, y1, color) {
    let startX = Math.round(x0);
    let startY = Math.round(y0);
    const endX = Math.round(x1);
    const endY = Math.round(y1);

    const dx = Math.abs(endX - startX);
    const sx = startX < endX ? 1 : -1;
    const dy = -Math.abs(endY - startY);
    const sy = startY < endY ? 1 : -1;
    let err = dx + dy;

    while (true) {
        screen.setPixel(startX, startY, color);

        if (startX === endX && startY === endY) {
            break;
        }

        const err2 = err * 2;
        if (err2 >= dy) {
            err += dy;
            startX += sx;
        }
        if (err2 <= dx) {
            err += dx;
            startY += sy;
        }
    }
}

function getTileColor(tileType) {
    if (tileType <= 0) {
        return COLORS.empty;
    }

    switch (tileType) {
        case 1:
            return Screen.rgb(152, 48, 48);
        case 2:
            return Screen.rgb(132, 132, 132);
        case 3:
            return Screen.rgb(138, 102, 60);
        case 4:
            return Screen.rgb(70, 92, 148);
        case 5:
            return Screen.rgb(118, 122, 142);
        case 6:
            return Screen.rgb(166, 46, 46);
        case 7:
            return Screen.rgb(204, 186, 92);
        case 8:
            return Screen.rgb(126, 126, 126);
        default:
            return Screen.rgb(184, 138, 52);
    }
}

function getEntityColor(entity) {
    if (entity.type === 'commander') {
        if (entity.state === 'death') {
            return Screen.rgb(112, 48, 48);
        }
        return COLORS.commander;
    }

    if (entity.type === 'officer') {
        if (entity.state === 'death') {
            return Screen.rgb(42, 82, 104);
        }
        return COLORS.officer;
    }

    if (entity.type === 'dog') {
        if (entity.state === 'death') {
            return Screen.rgb(96, 68, 44);
        }
        return COLORS.dog;
    }

    switch (entity.state) {
        case 'death':
            return Screen.rgb(96, 56, 56);
        case 'chase':
            return COLORS.chase;
        case 'patrol':
            return COLORS.patrol;
        case 'stand':
        default:
            return COLORS.stand;
    }
}

function getPickupColor(pickup) {
    switch (pickup.type) {
        case 'medkit':
            return COLORS.medkit;
        case 'gold-key':
            return COLORS.goldKey;
        case 'silver-key':
            return COLORS.silverKey;
        case 'knife':
        case 'pistol':
        case 'shotgun':
        case 'machinegun':
        case 'chaingun':
            return COLORS.weapon;
        case 'armor':
            return COLORS.armor;
        case 'treasure':
            return COLORS.treasure;
        case 'ammo':
        default:
            return COLORS.ammo;
    }
}

function drawDoors(screen, map) {
    for (const door of map.doors) {
        const rect = map.getDoorRect(door.x, door.y);
        fillRect(
            screen,
            MARGIN + door.x * TILE_SIZE + 1,
            MARGIN + door.y * TILE_SIZE + 1,
            TILE_SIZE - 2,
            TILE_SIZE - 2,
            COLORS.empty
        );

        if (!rect) {
            continue;
        }

        fillRect(
            screen,
            MARGIN + rect.minX * TILE_SIZE,
            MARGIN + rect.minY * TILE_SIZE,
            Math.max(1, (rect.maxX - rect.minX) * TILE_SIZE),
            Math.max(1, (rect.maxY - rect.minY) * TILE_SIZE),
            getTileColor(door.tile)
        );
    }
}

function drawEntities(screen, entities) {
    for (const entity of entities) {
        if (entity.state === 'death') {
            fillRect(
                screen,
                MARGIN + entity.x * TILE_SIZE - 2,
                MARGIN + entity.y * TILE_SIZE,
                5,
                2,
                getEntityColor(entity)
            );
            continue;
        }

        if (entity.patrolPoints?.length > 1) {
            for (let i = 0; i < entity.patrolPoints.length; i++) {
                const from = entity.patrolPoints[i];
                const to = entity.patrolPoints[(i + 1) % entity.patrolPoints.length];
                drawLine(
                    screen,
                    MARGIN + from.x * TILE_SIZE,
                    MARGIN + from.y * TILE_SIZE,
                    MARGIN + to.x * TILE_SIZE,
                    MARGIN + to.y * TILE_SIZE,
                    COLORS.patrolPath
                );
            }
        }

        fillRect(
            screen,
            MARGIN + entity.x * TILE_SIZE - 1,
            MARGIN + entity.y * TILE_SIZE - 1,
            3,
            3,
            getEntityColor(entity)
        );
    }
}

function drawPickups(screen, pickups) {
    for (const pickup of pickups) {
        if (pickup.collected) {
            continue;
        }

        fillRect(
            screen,
            MARGIN + pickup.x * TILE_SIZE - 1,
            MARGIN + pickup.y * TILE_SIZE - 1,
            3,
            3,
            getPickupColor(pickup)
        );
    }
}

function drawProjectiles(screen, projectiles) {
    for (const projectile of projectiles) {
        if (projectile.dead) {
            continue;
        }

        fillRect(
            screen,
            MARGIN + projectile.x * TILE_SIZE - 1,
            MARGIN + projectile.y * TILE_SIZE - 1,
            3,
            3,
            COLORS.projectile
        );
    }
}

export function drawMinimap(screen, frame) {
    const {
        map,
        camera,
        rays,
        entities,
        pickups,
        projectiles = [],
        exit,
    } = frame;
    const panelWidth = map.width * TILE_SIZE + 2;
    const panelHeight = map.height * TILE_SIZE + 2;

    fillRect(screen, MARGIN - 1, MARGIN - 1, panelWidth, panelHeight, COLORS.border);
    fillRect(screen, MARGIN, MARGIN, map.width * TILE_SIZE, map.height * TILE_SIZE, COLORS.panel);

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const tile = map.tiles[y][x];
            if (map.isDoorTile(tile)) {
                continue;
            }

            fillRect(
                screen,
                MARGIN + x * TILE_SIZE + 1,
                MARGIN + y * TILE_SIZE + 1,
                TILE_SIZE - 2,
                TILE_SIZE - 2,
                getTileColor(tile)
            );
        }
    }

    drawDoors(screen, map);
    drawEntities(screen, entities);
    drawPickups(screen, pickups);
    drawProjectiles(screen, projectiles);

    if (exit) {
        fillRect(
            screen,
            MARGIN + exit.x * TILE_SIZE - 2,
            MARGIN + exit.y * TILE_SIZE - 2,
            5,
            5,
            COLORS.exit
        );
    }

    const playerX = MARGIN + camera.x * TILE_SIZE;
    const playerY = MARGIN + camera.y * TILE_SIZE;
    const lineLength = TILE_SIZE * 0.9;
    const fovLength = TILE_SIZE * 3.5;

    fillRect(screen, playerX - PLAYER_SIZE / 2, playerY - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE, COLORS.player);

    drawLine(
        screen,
        playerX,
        playerY,
        playerX + Math.cos(camera.angle) * lineLength,
        playerY + Math.sin(camera.angle) * lineLength,
        COLORS.direction
    );

    drawLine(
        screen,
        playerX,
        playerY,
        playerX + Math.cos(camera.angle - camera.fov / 2) * fovLength,
        playerY + Math.sin(camera.angle - camera.fov / 2) * fovLength,
        COLORS.fov
    );
    drawLine(
        screen,
        playerX,
        playerY,
        playerX + Math.cos(camera.angle + camera.fov / 2) * fovLength,
        playerY + Math.sin(camera.angle + camera.fov / 2) * fovLength,
        COLORS.fov
    );

    for (let i = 0; i < rays.length; i += DEBUG_RAY_STEP) {
        const ray = rays[i];
        if (!ray || !Number.isFinite(ray.rayDistance) || ray.rayDistance <= 0) {
            continue;
        }

        drawLine(
            screen,
            playerX,
            playerY,
            MARGIN + ray.hitX * TILE_SIZE,
            MARGIN + ray.hitY * TILE_SIZE,
            COLORS.ray
        );
    }
}
