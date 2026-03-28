/**
 * Shared circle-vs-world collision helpers.
 */

export function circleCollidesWall(map, x, y, radius) {
    const minTileX = Math.floor(x - radius);
    const maxTileX = Math.floor(x + radius);
    const minTileY = Math.floor(y - radius);
    const maxTileY = Math.floor(y + radius);

    for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
        for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
            if (map.tileBlocksCircle(tileX, tileY, x, y, radius)) {
                return true;
            }
        }
    }

    return false;
}

export function moveCircle(map, actor, moveX, moveY) {
    const radius = actor.radius ?? 0;

    if (moveX !== 0 && !circleCollidesWall(map, actor.x + moveX, actor.y, radius)) {
        actor.x += moveX;
    }

    if (moveY !== 0 && !circleCollidesWall(map, actor.x, actor.y + moveY, radius)) {
        actor.y += moveY;
    }
}
