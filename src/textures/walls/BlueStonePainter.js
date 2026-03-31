import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 2 — Blue stone wall (faithful to original Wolf3D).
 * Purple-blue stone blocks, slightly lighter and more purple than before.
 */
export class BlueStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#1a1a36');

        const blockH = 16;
        const blockW = 32;

        for (let row = 0; row < Math.ceil(height / blockH); row++) {
            const y = row * blockH;
            const offset = row % 2 === 1 ? blockW / 2 : 0;

            for (let column = -1; column < Math.ceil(width / blockW) + 1; column++) {
                const x = (column * blockW) + offset;
                if (x <= -blockW || x >= width) continue;

                const bX = Math.max(0, x + 1);
                const bY = y + 1;
                const bW = Math.min(blockW - 2, width - bX);
                const bH = Math.min(blockH - 2, height - bY);
                if (bW <= 0 || bH <= 0) continue;

                const r = 60 + Math.floor(this.hash(column, row, 1) * 20) - 10;
                const g = 60 + Math.floor(this.hash(column, row, 2) * 18) - 9;
                const b = 120 + Math.floor(this.hash(column, row, 3) * 30) - 15;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(bX, bY, bW, bH);

                ctx.fillStyle = `rgb(${Math.min(255, r + 18)},${Math.min(255, g + 18)},${Math.min(255, b + 22)})`;
                ctx.fillRect(bX, bY, bW, 1);
                ctx.fillRect(bX, bY, 1, bH);

                ctx.fillStyle = `rgb(${Math.max(0, r - 22)},${Math.max(0, g - 22)},${Math.max(0, b - 28)})`;
                ctx.fillRect(bX, bY + bH - 1, bW, 1);
                ctx.fillRect(bX + bW - 1, bY, 1, bH);
            }
        }

        this.addSurfaceNoise(ctx, width, height, 5);
    }
}
