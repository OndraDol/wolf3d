/**
 * Billboard sprite rendering from generated Canvas 2D sprite sheets.
 */

import { EnemyState } from '../ai/enemy.js';
import { normalizeAngle, selectFacingDirection } from '../sprites/enemies/frameUtils.js';
import { SPRITE_HEIGHT, SPRITE_WIDTH, spriteGenerator } from '../sprites/SpriteGenerator.js';
import { Screen } from './screen.js';

const FOG_NEAR = 3;
const FOG_FAR = 10;

const spriteQueue = [];

function applyFog(color, distance) {
    const fogAmount = Math.max(0, Math.min(1, (distance - FOG_NEAR) / (FOG_FAR - FOG_NEAR)));
    if (fogAmount <= 0) {
        return color;
    }

    const r = color & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = (color >> 16) & 0xFF;
    const retained = 1 - fogAmount;

    return (
        0xFF000000 |
        (Math.round(b * retained) << 16) |
        (Math.round(g * retained) << 8) |
        Math.round(r * retained)
    );
}

function fillRect(screen, x, y, width, height, color, depthBuffer, spriteDepth) {
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(screen.width, Math.ceil(x + width));
    const endY = Math.min(screen.height, Math.ceil(y + height));
    const pixels = screen.pixels;
    const screenWidth = screen.width;

    for (let py = startY; py < endY; py++) {
        const rowOffset = py * screenWidth;
        for (let px = startX; px < endX; px++) {
            if (spriteDepth >= depthBuffer[px]) {
                continue;
            }
            pixels[rowOffset + px] = color;
        }
    }
}

function blitSprite(screen, spritePixels, destX, destY, destWidth, destHeight, depthBuffer, spriteDepth) {
    const startX = Math.max(0, Math.floor(destX));
    const startY = Math.max(0, Math.floor(destY));
    const endX = Math.min(screen.width, Math.ceil(destX + destWidth));
    const endY = Math.min(screen.height, Math.ceil(destY + destHeight));
    const pixels = screen.pixels;
    const screenWidth = screen.width;

    for (let py = startY; py < endY; py++) {
        const sourceY = Math.min(
            SPRITE_HEIGHT - 1,
            Math.max(0, Math.floor(((py - destY) / Math.max(destHeight, 1)) * SPRITE_HEIGHT))
        );
        const rowOffset = py * screenWidth;
        const spriteRowOffset = sourceY * SPRITE_WIDTH;

        for (let px = startX; px < endX; px++) {
            if (spriteDepth >= depthBuffer[px]) {
                continue;
            }

            const sourceX = Math.min(
                SPRITE_WIDTH - 1,
                Math.max(0, Math.floor(((px - destX) / Math.max(destWidth, 1)) * SPRITE_WIDTH))
            );
            const color = spritePixels[spriteRowOffset + sourceX];
            if ((color >>> 24) === 0) {
                continue;
            }

            pixels[rowOffset + px] = applyFog(color, spriteDepth);
        }
    }
}

function drawProjectile(screen, projectile, x, y, size, depthBuffer, spriteDepth) {
    const glowColor = applyFog(projectile.type === 'plasma'
        ? Screen.rgb(72, 244, 255)
        : Screen.rgb(255, 196, 72), spriteDepth);
    const coreColor = applyFog(projectile.type === 'plasma'
        ? Screen.rgb(220, 255, 255)
        : Screen.rgb(255, 255, 196), spriteDepth);
    const pulse = 0.82 + Math.sin(projectile.age * 20) * 0.12;
    const glowSize = size * pulse;

    fillRect(screen, x + size * 0.18, y + size * 0.18, glowSize * 0.64, glowSize * 0.64, glowColor, depthBuffer, spriteDepth);
    fillRect(screen, x + size * 0.34, y + size * 0.34, size * 0.24, size * 0.24, coreColor, depthBuffer, spriteDepth);
}

function pushSprite(spriteCount, kind, payload, camera) {
    const item = spriteQueue[spriteCount] ?? (spriteQueue[spriteCount] = {});
    item.kind = kind;
    item.payload = payload;
    item.dx = payload.x - camera.x;
    item.dy = payload.y - camera.y;
    item.distanceSq = (item.dx * item.dx) + (item.dy * item.dy);
    return spriteCount + 1;
}

function getEnemyPrefix(entityType) {
    switch (entityType) {
        case 'officer':
            return 'officer';
        case 'commander':
            return 'commander';
        case 'dog':
            return 'dog';
        case 'boss':
            return 'boss';
        case 'guard':
        default:
            return 'guard';
    }
}

function getEnemySpriteKey(entity) {
    const prefix = getEnemyPrefix(entity.type);
    const toCameraAngle = Math.atan2(spriteViewCamera.y - entity.y, spriteViewCamera.x - entity.x);
    const delta = normalizeAngle(toCameraAngle - entity.angle);
    const direction = selectFacingDirection(delta, entity.spriteDirection);
    entity.spriteDirection = direction;
    switch (entity.state) {
        case EnemyState.PATROL:
        case EnemyState.CHASE:
            return `${prefix}_walk_${direction}_${Math.floor(entity.animationTime * 7) % 2}`;
        case EnemyState.ATTACK:
            return `${prefix}_attack_${direction}_${Math.floor(entity.animationTime * 12) % 2}`;
        case EnemyState.PAIN:
            if (prefix === 'dog') {
                return `${prefix}_walk_${direction}_0`;
            }
            return `${prefix}_pain_${direction}_0`;
        case EnemyState.DEATH:
            return `${prefix}_death_${direction}_${Math.min(1, Math.floor(entity.deathTimer * 4))}`;
        case EnemyState.STAND:
        default:
            return `${prefix}_stand_${direction}_0`;
    }
}

let spriteViewCamera = { x: 0, y: 0 };

function hashString(value = '') {
    let hash = 0;
    for (let index = 0; index < value.length; index++) {
        hash = ((hash * 31) + value.charCodeAt(index)) >>> 0;
    }
    return hash;
}

function getTreasureSpriteKey(pickup) {
    const treasureKeys = [
        'pickup_treasure_cross_0',
        'pickup_treasure_chalice_0',
        'pickup_treasure_chest_0',
        'pickup_treasure_crown_0',
    ];
    return treasureKeys[hashString(pickup.id ?? pickup.label ?? 'treasure') % treasureKeys.length];
}

function getPickupSpriteKey(pickup) {
    switch (pickup.type) {
        case 'medkit':
            return 'pickup_medkit_0';
        case 'ammo':
            return 'pickup_ammo_0';
        case 'armor':
            return 'pickup_armor_0';
        case 'gold-key':
            return 'pickup_gold_key_0';
        case 'silver-key':
            return 'pickup_silver_key_0';
        case 'shotgun':
            return 'pickup_shotgun_0';
        case 'food':
        case 'chicken':
            return 'pickup_food_0';
        case 'knife':
            return 'pickup_knife_0';
        case 'pistol':
            return 'pickup_pistol_0';
        case 'machinegun':
            return 'pickup_machinegun_0';
        case 'chaingun':
            return 'pickup_chaingun_0';
        case 'treasure':
            return getTreasureSpriteKey(pickup);
        default:
            return 'pickup_ammo_0';
    }
}

function getPropSpriteKey(prop) {
    switch (prop.type) {
        case 'barrel':
            return 'decor_barrel_0';
        case 'table':
            return 'decor_table_0';
        case 'lamp':
            return 'decor_lamp_0';
        case 'skeleton':
            return 'decor_skeleton_0';
        case 'plant':
            return 'decor_plant_0';
        case 'armor':
        case 'armor-statue':
            return 'decor_armor_0';
        case 'blood':
            return 'decor_blood_0';
        case 'column':
            return 'decor_column_0';
        case 'pot':
            return 'decor_pot_0';
        default:
            return 'decor_barrel_0';
    }
}

export function drawSprites(screen, frame) {
    const {
        camera,
        entities,
        pickups,
        props = [],
        projectiles = [],
        depthBuffer,
    } = frame;
    const dirX = camera.dirX;
    const dirY = camera.dirY;
    const planeScale = Math.tan(camera.fov / 2);
    const planeX = -dirY * planeScale;
    const planeY = dirX * planeScale;
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    spriteViewCamera = camera;

    let spriteCount = 0;
    for (const entity of entities) {
        spriteCount = pushSprite(spriteCount, 'entity', entity, camera);
    }
    for (const pickup of pickups) {
        if (!pickup.collected) {
            spriteCount = pushSprite(spriteCount, 'pickup', pickup, camera);
        }
    }
    for (const prop of props) {
        spriteCount = pushSprite(spriteCount, 'prop', prop, camera);
    }
    for (const projectile of projectiles) {
        if (!projectile.dead) {
            spriteCount = pushSprite(spriteCount, 'projectile', projectile, camera);
        }
    }

    spriteQueue.length = spriteCount;
    spriteQueue.sort((a, b) => b.distanceSq - a.distanceSq);

    for (let i = 0; i < spriteQueue.length; i++) {
        const item = spriteQueue[i];
        const transformX = invDet * (dirY * item.dx - dirX * item.dy);
        const transformY = invDet * (-planeY * item.dx + planeX * item.dy);

        if (transformY <= 0.1) {
            continue;
        }

        const spriteScreenX = Math.floor((screen.width / 2) * (1 + transformX / transformY));
        const baseHeight = Math.abs(Math.floor(screen.height / transformY));
        const spriteHeight = item.kind === 'prop'
            ? Math.max(24, Math.floor(baseHeight * (item.payload.scale ?? 1)))
            : baseHeight;
        const spriteWidth = item.kind === 'pickup'
            ? Math.max(18, Math.floor(spriteHeight * 0.76))
            : (item.kind === 'projectile'
                ? Math.max(10, Math.floor(spriteHeight * 0.32))
                : (item.kind === 'prop'
                    ? Math.max(18, Math.floor(spriteHeight * 0.8))
                    : spriteHeight));
        const drawX = spriteScreenX - spriteWidth / 2;
        const drawY = item.kind === 'pickup'
            ? screen.height / 2 - spriteHeight * 0.28
            : (item.kind === 'projectile'
                ? screen.height / 2 - spriteHeight * 0.12
                : (item.kind === 'prop'
                    ? screen.height / 2 - spriteHeight * 0.42
                    : screen.height / 2 - spriteHeight / 2));

        if (drawX >= screen.width || drawX + spriteWidth < 0) {
            continue;
        }

        if (item.kind === 'pickup') {
            blitSprite(
                screen,
                spriteGenerator.paintSprite(getPickupSpriteKey(item.payload)),
                drawX,
                drawY,
                spriteWidth,
                spriteHeight,
                depthBuffer,
                transformY
            );
            continue;
        }

        if (item.kind === 'projectile') {
            drawProjectile(screen, item.payload, drawX, drawY, spriteWidth, depthBuffer, transformY);
            continue;
        }

        if (item.kind === 'prop') {
            blitSprite(
                screen,
                spriteGenerator.paintSprite(getPropSpriteKey(item.payload)),
                drawX,
                drawY,
                spriteWidth,
                spriteHeight,
                depthBuffer,
                transformY
            );
            continue;
        }

        blitSprite(
            screen,
            spriteGenerator.paintSprite(getEnemySpriteKey(item.payload)),
            drawX,
            drawY,
            spriteWidth,
            spriteHeight,
            depthBuffer,
            transformY
        );
    }
}
