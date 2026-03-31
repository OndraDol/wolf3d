import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 1 — Red-brown brick wall (faithful to original Wolf3D).
 * Warm red-brown bricks with dark mortar lines.
 */
export class BrickWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Dark mortar background
        this.clear(ctx, width, height, '#2a1a0a');

        const brickWidth = 16;
        const brickHeight = 8;

        for (let row = 0; row < Math.ceil(height / brickHeight); row++) {
            const y = row * brickHeight;
            const offset = row % 2 === 1 ? brickWidth / 2 : 0;

            for (let column = -1; column < Math.ceil(width / brickWidth) + 1; column++) {
                const x = (column * brickWidth) + offset;
                if (x <= -brickWidth || x >= width) continue;

                const baseR = 140 + Math.floor(this.hash(column, row, 1) * 30) - 15;
                const baseG = 56 + Math.floor(this.hash(column, row, 2) * 20) - 10;
                const baseB = 28 + Math.floor(this.hash(column, row, 3) * 16) - 8;

                const brickX = Math.max(0, x + 1);
                const brickY = y + 1;
                const brickW = Math.min(brickWidth - 1, width - brickX);
                const brickH = Math.min(brickHeight - 1, height - brickY);
                if (brickW <= 0 || brickH <= 0) continue;

                ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
                ctx.fillRect(brickX, brickY, brickW, brickH);

                ctx.fillStyle = `rgb(${Math.min(255, baseR + 25)},${Math.min(255, baseG + 12)},${Math.min(255, baseB + 8)})`;
                ctx.fillRect(brickX, brickY, brickW, 1);
                ctx.fillRect(brickX, brickY, 1, brickH);

                ctx.fillStyle = `rgb(${Math.max(0, baseR - 35)},${Math.max(0, baseG - 18)},${Math.max(0, baseB - 12)})`;
                ctx.fillRect(brickX, brickY + brickH - 1, brickW, 1);
                ctx.fillRect(brickX + brickW - 1, brickY, 1, brickH);
            }
        }

        this.addSurfaceNoise(ctx, width, height, 5);
    }
}
