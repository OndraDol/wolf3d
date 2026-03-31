import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 6 — Eagle/Banner ornament wall — exact copy of original Wolf3D.
 * Original: Deep red wall background, golden eagle emblem in center.
 * Red ~RGB(168,0,0), gold border, eagle/iron cross in white medallion.
 */
export class OrnamentWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Deep red background (original Wolf3D red)
        this.clear(ctx, width, height, '#a80000');

        // Vertical fabric texture stripes (subtle, like original banner)
        ctx.save();
        ctx.globalAlpha = 0.06;
        for (let x = 0; x < width; x += 2) {
            ctx.fillStyle = x % 4 === 0 ? '#ffffff' : '#000000';
            ctx.fillRect(x, 0, 1, height);
        }
        ctx.restore();

        // Gold border frame (original has decorative gold frame)
        // Outer gold
        ctx.fillStyle = '#a87828';
        ctx.fillRect(0, 0, width, 3);
        ctx.fillRect(0, height - 3, width, 3);
        ctx.fillRect(0, 0, 3, height);
        ctx.fillRect(width - 3, 0, 3, height);
        // Inner gold highlight
        ctx.fillStyle = '#d0a030';
        ctx.fillRect(1, 1, width - 2, 1);
        ctx.fillRect(1, 1, 1, height - 2);
        // Inner gold shadow
        ctx.fillStyle = '#785818';
        ctx.fillRect(1, height - 2, width - 2, 1);
        ctx.fillRect(width - 2, 1, 1, height - 2);

        // Second inner border
        ctx.fillStyle = '#a80000';
        ctx.fillRect(3, 3, width - 6, height - 6);

        // White/cream medallion circle in center
        const cx = width / 2;
        const cy = height / 2;
        ctx.fillStyle = '#e8dcc8';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        // Circle border
        ctx.strokeStyle = '#a87828';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Eagle / Iron Cross symbol (original has detailed eagle, we paint iron cross)
        ctx.fillStyle = '#181818';
        // Vertical bar (thick center cross)
        ctx.fillRect(cx - 2, cy - 10, 4, 20);
        // Horizontal bar
        ctx.fillRect(cx - 10, cy - 2, 20, 4);
        // Flared arm ends — top
        ctx.fillRect(cx - 4, cy - 10, 8, 2);
        // Flared arm ends — bottom
        ctx.fillRect(cx - 4, cy + 8, 8, 2);
        // Flared arm ends — left
        ctx.fillRect(cx - 10, cy - 4, 2, 8);
        // Flared arm ends — right
        ctx.fillRect(cx + 8, cy - 4, 2, 8);

        // Corner decorative dots (original has small gold accents in corners)
        ctx.fillStyle = '#d0a030';
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillRect(width - 7, 5, 2, 2);
        ctx.fillRect(5, height - 7, 2, 2);
        ctx.fillRect(width - 7, height - 7, 2, 2);

        this.addSurfaceNoise(ctx, width, height, 2);
    }
}
