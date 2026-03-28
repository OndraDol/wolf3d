/**
 * Kamera / hráč — pozice, úhel, pohyb, kolize.
 * Souřadnice v tile space (1.0 = 1 tile).
 */

const MOVE_SPEED = 3.0;   // tiles/s
const ROT_SPEED = 2.5;    // rad/s

export class Camera {
    constructor(map) {
        this.map = map;

        // Spawn pozice — střed mapy (bude z levelu)
        this.x = 2.5;
        this.y = 2.5;
        this.angle = 0; // radiány, 0 = východ

        // FOV
        this.fov = Math.PI / 3; // 60°
    }

    /** Směrový vektor */
    get dirX() { return Math.cos(this.angle); }
    get dirY() { return Math.sin(this.angle); }

    update(input, dt) {
        // Rotace
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
            this.angle -= ROT_SPEED * dt;
        }
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
            this.angle += ROT_SPEED * dt;
        }

        // Pohyb vpřed/vzad
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

        // Strafe
        if (input.isDown('KeyQ')) {
            moveX += this.dirY * MOVE_SPEED * dt;
            moveY -= this.dirX * MOVE_SPEED * dt;
        }
        if (input.isDown('KeyE')) {
            moveX -= this.dirY * MOVE_SPEED * dt;
            moveY += this.dirX * MOVE_SPEED * dt;
        }

        // Kolize — po osách zvlášť (sliding podél stěn)
        const RADIUS = 0.2;

        if (!this.map.isWall(this.x + moveX + Math.sign(moveX) * RADIUS, this.y)) {
            this.x += moveX;
        }
        if (!this.map.isWall(this.x, this.y + moveY + Math.sign(moveY) * RADIUS)) {
            this.y += moveY;
        }
    }
}
