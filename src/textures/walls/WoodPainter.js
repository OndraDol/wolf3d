import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 3 — Wood panel wall (faithful to original Wolf3D).
 * Vertical wood planks, warm tan-brown with visible panel borders.
 * Horizontal cross-beam at center.
 */
export class WoodPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Base wood grain
        this.drawWoodGrain(ctx, width, height, '#7a5530', '#9a6a40');

        const plankWidth = 10;
        for (let x = 0; x < width; x += plankWidth) {
            const r = 110 + Math.floor(this.hash(x, 0, 1) * 30) - 15;
            const g = 76 + Math.floor(this.hash(x, 0, 2) * 20) - 10;
            const b = 42 + Math.floor(this.hash(x, 0, 3) * 16) - 8;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, 0, plankWidth - 1, height);

            // Left edge highlight
            ctx.fillStyle = `rgb(${Math.min(255, r + 20)},${Math.min(255, g + 14)},${Math.min(255, b + 10)})`;
            ctx.fillRect(x, 0, 1, height);

            // Right edge shadow (dark groove)
            ctx.fillStyle = `rgb(${Math.max(0, r - 40)},${Math.max(0, g - 30)},${Math.max(0, b - 20)})`;
            ctx.fillRect(x + plankWidth - 1, 0, 1, height);

            // Wood knots
            if (this.hash(x, width, 17) > 0.72) {
                const knotY = 10 + Math.floor(this.hash(x, 4, 21) * (height - 20));
                ctx.fillStyle = `rgb(${Math.max(0, r - 30)},${Math.max(0, g - 24)},${Math.max(0, b - 16)})`;
                ctx.beginPath();
                ctx.ellipse(x + plankWidth / 2, knotY, 2.5, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Horizontal cross-beam at 1/3 and 2/3 height
        ctx.fillStyle = '#4a3018';
        ctx.fillRect(0, Math.floor(height / 3) - 2, width, 4);
        ctx.fillRect(0, Math.floor(height * 2 / 3) - 2, width, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, Math.floor(height / 3) - 2, width, 1);
        ctx.fillRect(0, Math.floor(height * 2 / 3) - 2, width, 1);

        // Subtle grain overlay
        ctx.save();
        ctx.globalAlpha = 0.14;
        ctx.strokeStyle = '#a07040';
        ctx.lineWidth = 1;
        for (let band = 3; band < height; band += 5) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 2) {
                const wave = Math.sin((x * 0.18) + (band * 0.2)) * 1.2;
                if (x === 0) ctx.moveTo(x, band + wave);
                else ctx.lineTo(x, band + wave);
            }
            ctx.stroke();
        }
        ctx.restore();

        this.addSurfaceNoise(ctx, width, height, 4);
    }
}
