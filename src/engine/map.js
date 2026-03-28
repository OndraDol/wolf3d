/**
 * Runtime map state: static tiles plus animated door state.
 */

const DEFAULT_MAP = [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
];

const DOOR_TILE_START = 64;
const DOOR_TILE_END = 100;
const DOOR_OPEN_SPEED = 1.8;
const DOOR_HOLD_OPEN_TIME = 2.5;
const DOOR_REBLOCK_DELAY = 0.2;
const DOOR_THICKNESS = 0.18;
const AXIS_VERTICAL = 'vertical';
const AXIS_HORIZONTAL = 'horizontal';

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function circleIntersectsRect(cx, cy, radius, minX, minY, maxX, maxY) {
    const nearestX = clamp(cx, minX, maxX);
    const nearestY = clamp(cy, minY, maxY);
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return (dx * dx) + (dy * dy) <= radius * radius;
}

export class GameMap {
    constructor(level = { tiles: DEFAULT_MAP, doors: [] }) {
        const source = Array.isArray(level) ? { tiles: level, doors: [] } : level;
        this.tiles = source.tiles ?? DEFAULT_MAP;
        this.height = this.tiles.length;
        this.width = this.tiles[0].length;
        this.doors = [];
        this.doorLookup = new Map();

        this.initDoors(source.doors ?? []);
    }

    initDoors(doorDefinitions) {
        if (doorDefinitions.length > 0) {
            for (const door of doorDefinitions) {
                this.registerDoor(door.x, door.y, door.tile ?? this.getTile(door.x, door.y), door.lock ?? 'none');
            }
            return;
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (this.isDoorTile(tile)) {
                    this.registerDoor(x, y, tile, 'none');
                }
            }
        }
    }

    registerDoor(x, y, tile, lock) {
        const state = {
            x,
            y,
            tile,
            lock,
            axis: this.inferDoorAxis(x, y),
            open: 0,
            direction: 0,
            holdTimer: 0,
        };
        const key = this.getDoorKey(x, y);
        this.doors.push(state);
        this.doorLookup.set(key, state);
    }

    getDoorKey(x, y) {
        return y * this.width + x;
    }

    getTile(x, y) {
        const tx = Math.floor(x);
        const ty = Math.floor(y);

        if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) {
            return 1;
        }

        return this.tiles[ty][tx];
    }

    isWallTile(tile) {
        return tile > 0 && tile < DOOR_TILE_START;
    }

    isDoorTile(tile) {
        return tile >= DOOR_TILE_START && tile < DOOR_TILE_END;
    }

    isSolidNeighbour(x, y) {
        const tile = this.getTile(x, y);
        return this.isWallTile(tile) || this.isDoorTile(tile);
    }

    inferDoorAxis(x, y) {
        const leftOpen = !this.isSolidNeighbour(x - 1, y);
        const rightOpen = !this.isSolidNeighbour(x + 1, y);
        const topOpen = !this.isSolidNeighbour(x, y - 1);
        const bottomOpen = !this.isSolidNeighbour(x, y + 1);
        const leftSolid = this.isSolidNeighbour(x - 1, y);
        const rightSolid = this.isSolidNeighbour(x + 1, y);
        const topSolid = this.isSolidNeighbour(x, y - 1);
        const bottomSolid = this.isSolidNeighbour(x, y + 1);
        const horizontalFlow = Number(leftOpen) + Number(rightOpen);
        const verticalFlow = Number(topOpen) + Number(bottomOpen);

        if (horizontalFlow > verticalFlow) {
            return AXIS_VERTICAL;
        }

        if (verticalFlow > horizontalFlow) {
            return AXIS_HORIZONTAL;
        }

        if (topSolid && bottomSolid && !(leftSolid && rightSolid)) {
            return AXIS_VERTICAL;
        }

        if (leftSolid && rightSolid && !(topSolid && bottomSolid)) {
            return AXIS_HORIZONTAL;
        }

        return (topSolid && bottomSolid) ? AXIS_VERTICAL : AXIS_HORIZONTAL;
    }

    getDoorAt(x, y) {
        return this.doorLookup.get(this.getDoorKey(x, y)) ?? null;
    }

    getDoorOpenAmount(x, y) {
        return this.getDoorAt(x, y)?.open ?? 0;
    }

    getDoorRect(x, y) {
        const door = this.getDoorAt(x, y);
        if (!door) {
            return null;
        }

        const open = clamp(door.open, 0, 1);
        if (open >= 1) {
            return null;
        }

        if (door.axis === AXIS_VERTICAL) {
            return {
                minX: x + 0.5 - DOOR_THICKNESS / 2,
                maxX: x + 0.5 + DOOR_THICKNESS / 2,
                minY: y + open,
                maxY: y + 1,
            };
        }

        return {
            minX: x + open,
            maxX: x + 1,
            minY: y + 0.5 - DOOR_THICKNESS / 2,
            maxY: y + 0.5 + DOOR_THICKNESS / 2,
        };
    }

    raycastDoor(x, y, originX, originY, dirX, dirY) {
        const door = this.getDoorAt(x, y);
        const rect = this.getDoorRect(x, y);
        if (!door || !rect) {
            return null;
        }

        if (door.axis === AXIS_VERTICAL) {
            if (Math.abs(dirX) < 1e-8) {
                return null;
            }

            const hitX = x + 0.5;
            const distance = (hitX - originX) / dirX;
            if (distance <= 0) {
                return null;
            }

            const hitY = originY + distance * dirY;
            if (hitY < rect.minY || hitY > rect.maxY) {
                return null;
            }

            return {
                distance,
                hitX,
                hitY,
                side: 0,
                textureX: clamp(hitY - y, 0, 1),
            };
        }

        if (Math.abs(dirY) < 1e-8) {
            return null;
        }

        const hitY = y + 0.5;
        const distance = (hitY - originY) / dirY;
        if (distance <= 0) {
            return null;
        }

        const hitX = originX + distance * dirX;
        if (hitX < rect.minX || hitX > rect.maxX) {
            return null;
        }

        return {
            distance,
            hitX,
            hitY,
            side: 1,
            textureX: clamp(hitX - x, 0, 1),
        };
    }

    tileBlocksCircle(tileX, tileY, centerX, centerY, radius) {
        const tile = this.getTile(tileX, tileY);

        if (this.isWallTile(tile)) {
            return circleIntersectsRect(centerX, centerY, radius, tileX, tileY, tileX + 1, tileY + 1);
        }

        if (!this.isDoorTile(tile)) {
            return false;
        }

        const rect = this.getDoorRect(tileX, tileY);
        if (!rect) {
            return false;
        }

        return circleIntersectsRect(centerX, centerY, radius, rect.minX, rect.minY, rect.maxX, rect.maxY);
    }

    isWall(x, y) {
        return this.tileBlocksCircle(Math.floor(x), Math.floor(y), x, y, 0);
    }

    actorBlocksDoor(door, actor) {
        if (!actor || !Number.isFinite(actor.x) || !Number.isFinite(actor.y)) {
            return false;
        }

        const radius = actor.radius ?? 0.2;
        return circleIntersectsRect(actor.x, actor.y, radius, door.x, door.y, door.x + 1, door.y + 1);
    }

    isDoorBlocked(door, player, entities) {
        if (this.actorBlocksDoor(door, player)) {
            return true;
        }

        for (const entity of entities) {
            if (this.actorBlocksDoor(door, entity)) {
                return true;
            }
        }

        return false;
    }

    canUnlockDoor(door, actor) {
        if (!door || !door.lock || door.lock === 'none') {
            return true;
        }

        return actor?.keys?.has(door.lock) ?? false;
    }

    openDoor(door, actor) {
        if (!door || !this.canUnlockDoor(door, actor)) {
            return false;
        }

        door.direction = 1;
        door.holdTimer = DOOR_HOLD_OPEN_TIME;
        return true;
    }

    findDoorInDirection(originX, originY, angle, maxDistance = 1.25) {
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        for (let distance = 0.2; distance <= maxDistance; distance += 0.05) {
            const sampleX = originX + dirX * distance;
            const sampleY = originY + dirY * distance;
            const door = this.getDoorAt(Math.floor(sampleX), Math.floor(sampleY));

            if (door) {
                return door;
            }

            if (this.isWallTile(this.getTile(sampleX, sampleY))) {
                return null;
            }
        }

        return null;
    }

    tryOpenDoor(originX, originY, angle, actor = null) {
        return this.openDoor(this.findDoorInDirection(originX, originY, angle), actor);
    }

    update(dt, player, entities = []) {
        for (const door of this.doors) {
            if (door.direction > 0) {
                door.open = Math.min(1, door.open + dt * DOOR_OPEN_SPEED);
                if (door.open >= 1) {
                    door.open = 1;
                    door.direction = 0;
                }
                door.holdTimer = DOOR_HOLD_OPEN_TIME;
                continue;
            }

            if (door.holdTimer > 0) {
                door.holdTimer = Math.max(0, door.holdTimer - dt);
                continue;
            }

            if (door.open <= 0) {
                door.open = 0;
                door.direction = 0;
                continue;
            }

            if (this.isDoorBlocked(door, player, entities)) {
                door.holdTimer = DOOR_REBLOCK_DELAY;
                continue;
            }

            door.direction = -1;
            door.open = Math.max(0, door.open - dt * DOOR_OPEN_SPEED);
            if (door.open <= 0) {
                door.open = 0;
                door.direction = 0;
            }
        }
    }
}
