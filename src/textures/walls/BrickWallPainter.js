import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 1 — Red brick wall — exact copy of original Wolf3D.
 * Original: 16x8 bricks, deep red (VGA palette reds ~152-176,24-48,8-20),
 * dark mortar (~40,20,8), half-brick offset on alternating rows.
 * Black lines at top and bottom row of texture.
 */
export class BrickWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Dark mortar fill (matches original mortar color)
        this.clear(ctx, width, height, '#281408');

        const bw = 16; // brick width
        const bh = 8;  // brick height
        const rows = height / bh;

        for (let row = 0; row < rows; row++) {
            const y = row * bh;
            const offset = (row % 2) * (bw / 2);

            for (let col = -1; col <= Math.ceil(width / bw); col++) {
                const x = col * bw + offset;
                const bx = Math.max(0, x + 1);
                const by = y + 1;
                const bRight = Math.min(width, x + bw);
                const bBottom = Math.min(height, y + bh);
                const bWidth = bRight - bx - 1;
                const bHeight = bBottom - by - 1;
                if (bWidth <= 0 || bHeight <= 0) continue;

                // Each brick has slightly different shade — original uses palette cycling
                const seed = row * 7 + col * 13;
                const variation = this.hash(col, row, 42);
                const r = 148 + Math.floor(variation * 36);
                const g = 28 + Math.floor(variation * 16);
                const b = 12 + Math.floor(variation * 12);

                // Main brick face
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(bx, by, bWidth, bHeight);

                // Top edge highlight (lighter)
                ctx.fillStyle = `rgb(${Math.min(255, r + 28)},${Math.min(255, g + 14)},${Math.min(255, b + 8)})`;
                ctx.fillRect(bx, by, bWidth, 1);

                // Left edge highlight
                ctx.fillStyle = `rgb(${Math.min(255, r + 20)},${Math.min(255, g + 10)},${Math.min(255, b + 6)})`;
                ctx.fillRect(bx, by, 1, bHeight);

                // Bottom edge shadow
                ctx.fillStyle = `rgb(${Math.max(0, r - 40)},${Math.max(0, g - 14)},${Math.max(0, b - 8)})`;
                ctx.fillRect(bx, by + bHeight - 1, bWidth, 1);

                // Right edge shadow
                ctx.fillStyle = `rgb(${Math.max(0, r - 32)},${Math.max(0, g - 12)},${Math.max(0, b - 6)})`;
                ctx.fillRect(bx + bWidth - 1, by, 1, bHeight);
            }
        }

        // Original has dark lines at very top and bottom of texture
        ctx.fillStyle = '#180800';
        ctx.fillRect(0, 0, width, 1);
        ctx.fillRect(0, height - 1, width, 1);

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
