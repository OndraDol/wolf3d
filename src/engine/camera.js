/**
 * Player camera and movement state.
 */

import { moveCircle } from './collision.js';

const MOVE_SPEED = 3.0;
const ROT_SPEED = 2.5;

export class Camera {
    constructor(map, spawn = null) {
        this.map = map;
        this.x = spawn?.x ?? 2.5;
        this.y = spawn?.y ?? 2.5;
        this.angle = spawn?.angle ?? 0;
        this.radius = 0.2;
        this.keys = new Set();
        this.fov = Math.PI / 3;
    }

    get dirX() {
        return Math.cos(this.angle);
    }

    get dirY() {
        return Math.sin(this.angle);
    }

    update(input, dt) {
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
            this.angle -= ROT_SPEED * dt;
        }
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
            this.angle += ROT_SPEED * dt;
        }

        let moveX = 0;
        let moveY = 0;

        if (input.isDown('ArrowUp') || input.isDown('KeyW')) {
            moveX += this.dirX * MOVE_SPEED * dt;
            moveY += this.dirY * MOVE_SPEED * dt;
        }
        if (input.isDown('ArrowDown') || input.isDown('KeyS')) {
            moveX -= this.dirX * MOVE_SPEED * dt;
            moveY -= this.dirY * MOVE_SPEED * dt;
        }
        if (input.isDown('KeyQ')) {
            moveX += this.dirY * MOVE_SPEED * dt;
            moveY -= this.dirX * MOVE_SPEED * dt;
        }
        if (input.isDown('KeyE')) {
            moveX -= this.dirY * MOVE_SPEED * dt;
            moveY += this.dirX * MOVE_SPEED * dt;
        }

        moveCircle(this.map, this, moveX, moveY);
    }
}
