import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 4 — Gray stone wall — exact copy of original Wolf3D.
 * Original: irregular rectangular stone blocks, medium gray palette
 * (VGA ~96-152 gray), dark mortar (~48,48,48), blocks ~16-32px wide, 8-16px tall.
 * Each block has subtle 1px highlight top-left and shadow bottom-right.
 */
export class GrayStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        // Dark mortar background (original Wolf3D mortar gray)
        this.clear(ctx, width, height, '#282828');

        // Pre-defined block layout matching the original stone pattern
        // Original has semi-regular blocks with slight size variation
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
                const blockW = 14 + Math.floor(this.hash(ci, ri, 3) * 12);
                const actualW = Math.min(blockW, width - x);
                if (actualW < 3) { x += actualW; ci++; continue; }

                // Stone shade — original uses palette grays
                const shade = 100 + Math.floor(this.hash(ci, ri, 7) * 48);

                // Main block face
                ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
                ctx.fillRect(x + 1, y + 1, actualW - 2, h - 2);

                // Top highlight
                const hi = Math.min(255, shade + 24);
                ctx.fillStyle = `rgb(${hi},${hi},${hi})`;
                ctx.fillRect(x + 1, y + 1, actualW - 2, 1);
                ctx.fillRect(x + 1, y + 1, 1, h - 2);

                // Bottom-right shadow
                const sh = Math.max(0, shade - 28);
                ctx.fillStyle = `rgb(${sh},${sh},${sh})`;
                ctx.fillRect(x + 1, y + h - 2, actualW - 2, 1);
                ctx.fillRect(x + actualW - 2, y + 1, 1, h - 2);

                x += actualW;
                ci++;
            }
        }

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
