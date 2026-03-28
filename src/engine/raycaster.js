/**
 * DDA raycaster with reusable hit records and a stable depth buffer.
 */

export class RayHit {
    constructor() {
        this.distance = Infinity;
        this.rayDistance = Infinity;
        this.tileType = 0;
        this.textureX = 0;
        this.side = 0;
        this.mapX = 0;
        this.mapY = 0;
        this.hitX = 0;
        this.hitY = 0;
        this.angle = 0;
    }
}

export class Raycaster {
    constructor(map, screenWidth, screenHeight) {
        this.map = map;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.rays = new Array(screenWidth);
        this.depthBuffer = new Float32Array(screenWidth);

        for (let i = 0; i < screenWidth; i++) {
            this.rays[i] = new RayHit();
            this.depthBuffer[i] = Infinity;
        }
    }

    castRays(camera) {
        const halfFov = camera.fov / 2;

        for (let col = 0; col < this.screenWidth; col++) {
            const screenX = (2 * col / this.screenWidth) - 1;
            const rayAngle = camera.angle + Math.atan(screenX * Math.tan(halfFov));
            this.castSingleRay(col, camera.x, camera.y, rayAngle, camera.angle);
        }

        return this.rays;
    }

    castSingleRay(col, originX, originY, rayAngle, cameraAngle) {
        const ray = this.rays[col];
        const dirX = Math.cos(rayAngle);
        const dirY = Math.sin(rayAngle);

        let mapX = Math.floor(originX);
        let mapY = Math.floor(originY);

        const deltaDistX = Math.abs(1 / dirX);
        const deltaDistY = Math.abs(1 / dirY);

        let stepX;
        let stepY;
        let sideDistX;
        let sideDistY;

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

        let hit = false;
        let side = 0;
        let tileType = 0;
        let rayDistance = Infinity;
        let hitX = originX;
        let hitY = originY;
        let textureX = 0;
        let safety = this.map.width * this.map.height * 4;

        while (!hit && safety-- > 0) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }

            tileType = this.map.getTile(mapX, mapY);

            if (this.map.isWallTile(tileType)) {
                rayDistance = side === 0
                    ? (mapX - originX + (1 - stepX) / 2) / dirX
                    : (mapY - originY + (1 - stepY) / 2) / dirY;
                hitX = originX + rayDistance * dirX;
                hitY = originY + rayDistance * dirY;
                textureX = side === 0 ? hitY - Math.floor(hitY) : hitX - Math.floor(hitX);
                hit = true;
                continue;
            }

            if (this.map.isDoorTile(tileType)) {
                const doorHit = this.map.raycastDoor(mapX, mapY, originX, originY, dirX, dirY);
                if (doorHit) {
                    rayDistance = doorHit.distance;
                    hitX = doorHit.hitX;
                    hitY = doorHit.hitY;
                    textureX = doorHit.textureX;
                    side = doorHit.side;
                    hit = true;
                }
            }
        }

        const correctedDistance = hit
            ? Math.max(0.0001, rayDistance * Math.cos(rayAngle - cameraAngle))
            : Infinity;

        ray.distance = correctedDistance;
        ray.rayDistance = rayDistance;
        ray.tileType = hit ? tileType : 0;
        ray.textureX = textureX;
        ray.side = side;
        ray.mapX = mapX;
        ray.mapY = mapY;
        ray.hitX = hitX;
        ray.hitY = hitY;
        ray.angle = rayAngle;

        this.depthBuffer[col] = correctedDistance;
    }
}
