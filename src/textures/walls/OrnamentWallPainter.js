import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 6 — Ornament/banner wall (faithful to original Wolf3D style).
 * Red wall with prominent iron cross symbol in white circle, gold border.
 */
export class OrnamentWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Deep red background
        this.clear(ctx, width, height, '#8b0000');

        // Subtle vertical stripes (banner fabric effect)
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let x = 0; x < width; x += 4) {
            ctx.fillStyle = x % 8 === 0 ? '#ffffff' : '#000000';
            ctx.fillRect(x, 0, 2, height);
        }
        ctx.restore();

        // Gold border frame
        ctx.fillStyle = '#c8960b';
        ctx.fillRect(0, 0, width, 3);
        ctx.fillRect(0, height - 3, width, 3);
        ctx.fillRect(0, 0, 3, height);
        ctx.fillRect(width - 3, 0, 3, height);
        // Inner gold highlight
        ctx.fillStyle = '#daa520';
        ctx.fillRect(1, 1, width - 2, 1);
        ctx.fillRect(1, 1, 1, height - 2);

        // White circle in center
        const cx = width / 2;
        const cy = height / 2;
        ctx.fillStyle = '#f0e8d8';
        ctx.beginPath();
        ctx.arc(cx, cy, 13, 0, Math.PI * 2);
        ctx.fill();

        // Iron cross symbol (symmetric)
        ctx.fillStyle = '#1a1a1a';
        // Vertical bar
        ctx.fillRect(cx - 3, cy - 10, 6, 20);
        // Horizontal bar
        ctx.fillRect(cx - 10, cy - 3, 20, 6);
        // Flared ends (top)
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy - 10);
        ctx.lineTo(cx - 3, cy - 7);
        ctx.lineTo(cx + 3, cy - 7);
        ctx.lineTo(cx + 5, cy - 10);
        ctx.closePath();
        ctx.fill();
        // Flared ends (bottom)
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + 10);
        ctx.lineTo(cx - 3, cy + 7);
        ctx.lineTo(cx + 3, cy + 7);
        ctx.lineTo(cx + 5, cy + 10);
        ctx.closePath();
        ctx.fill();
        // Flared ends (left)
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 5);
        ctx.lineTo(cx - 7, cy - 3);
        ctx.lineTo(cx - 7, cy + 3);
        ctx.lineTo(cx - 10, cy + 5);
        ctx.closePath();
        ctx.fill();
        // Flared ends (right)
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 5);
        ctx.lineTo(cx + 7, cy - 3);
        ctx.lineTo(cx + 7, cy + 3);
        ctx.lineTo(cx + 10, cy + 5);
        ctx.closePath();
        ctx.fill();

        // Vignette
        const vignette = ctx.createRadialGradient(cx, cy, 12, cx, cy, 40);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
