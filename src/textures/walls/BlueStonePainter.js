import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 2 — Blue stone wall — exact copy of original Wolf3D.
 * Same layout as gray stone but with blue palette colors.
 * Original: VGA blues ~RGB(48-80, 48-80, 104-152), dark blue mortar.
 */
export class BlueStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        // Dark blue mortar
        this.clear(ctx, width, height, '#141428');

        // Same block layout as gray stone
        const rows = [
            { y: 0, h: 12 },
            { y: 12, h: 10 },
            { y: 22, h: 14 },
            { y: 36, h: 10 },
            { y: 46, h: 8 },
            { y: 54, h: 10 },
        ];

        for (let ri = 0; ri < rows.length; ri++) {
            const { y, h } = rows[ri];
            const offset = ri % 2 === 0 ? 0 : 10;
            let x = offset;
            let ci = 0;

            while (x < width) {
                const blockW = 14 + Math.floor(this.hash(ci, ri, 5) * 12);
                const actualW = Math.min(blockW, width - x);
                if (actualW < 3) { x += actualW; ci++; continue; }

                // Blue stone shade — original Wolf3D blue palette
                const v = this.hash(ci, ri, 9);
                const r = 52 + Math.floor(v * 28);
                const g = 52 + Math.floor(v * 28);
                const b = 108 + Math.floor(v * 40);

                // Main block face
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x + 1, y + 1, actualW - 2, h - 2);

                // Top-left highlight
                ctx.fillStyle = `rgb(${Math.min(255, r + 20)},${Math.min(255, g + 20)},${Math.min(255, b + 28)})`;
                ctx.fillRect(x + 1, y + 1, actualW - 2, 1);
                ctx.fillRect(x + 1, y + 1, 1, h - 2);

                // Bottom-right shadow
                ctx.fillStyle = `rgb(${Math.max(0, r - 24)},${Math.max(0, g - 24)},${Math.max(0, b - 32)})`;
                ctx.fillRect(x + 1, y + h - 2, actualW - 2, 1);
                ctx.fillRect(x + actualW - 2, y + 1, 1, h - 2);

                x += actualW;
                ci++;
            }
        }

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
