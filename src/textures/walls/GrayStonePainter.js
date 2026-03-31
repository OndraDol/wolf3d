import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 4 — Gray stone wall (faithful to original Wolf3D).
 * Lighter gray rectangular stone blocks with clear mortar.
 */
export class GrayStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#3a3a3a');

        // More uniform rectangular blocks
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

                const shade = 100 + Math.floor(this.hash(column, row, 3) * 30) - 15;
                ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
                ctx.fillRect(bX, bY, bW, bH);

                // Highlight top-left
                ctx.fillStyle = `rgb(${Math.min(255, shade + 20)},${Math.min(255, shade + 20)},${Math.min(255, shade + 20)})`;
                ctx.fillRect(bX, bY, bW, 1);
                ctx.fillRect(bX, bY, 1, bH);

                // Shadow bottom-right
                ctx.fillStyle = `rgb(${Math.max(0, shade - 25)},${Math.max(0, shade - 25)},${Math.max(0, shade - 25)})`;
                ctx.fillRect(bX, bY + bH - 1, bW, 1);
                ctx.fillRect(bX + bW - 1, bY, 1, bH);
            }
        }

        this.addSurfaceNoise(ctx, width, height, 4);
    }
}
