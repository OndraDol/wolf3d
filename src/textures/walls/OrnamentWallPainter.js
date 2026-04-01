import { TexturePainter } from '../TexturePainter.js';

export class OrnamentWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Deep red background
        this.clear(ctx, width, height, '#A80000');

        // Gold border frame
        ctx.fillStyle = '#D0A030';
        ctx.fillRect(0, 0, width, 3);
        ctx.fillRect(0, height - 3, width, 3);
        ctx.fillRect(0, 0, 3, height);
        ctx.fillRect(width - 3, 0, 3, height);

        // Inner gold border
        ctx.fillStyle = '#B08020';
        ctx.fillRect(4, 4, width - 8, 2);
        ctx.fillRect(4, height - 6, width - 8, 2);
        ctx.fillRect(4, 4, 2, height - 8);
        ctx.fillRect(width - 6, 4, 2, height - 8);

        // Subtle texture on red background
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let x = 0; x < width; x += 6) {
            ctx.fillStyle = x % 12 === 0 ? '#ffffff' : '#000000';
            ctx.fillRect(x, 0, 3, height);
        }
        ctx.restore();

        // White/cream medallion circle
        ctx.fillStyle = '#F0E8D8';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 13, 0, Math.PI * 2);
        ctx.fill();

        // Iron cross symbol in medallion
        ctx.fillStyle = '#2A2A2A';
        const cx = width / 2;
        const cy = height / 2;
        // Vertical bar
        ctx.fillRect(cx - 2, cy - 10, 4, 20);
        // Horizontal bar
        ctx.fillRect(cx - 10, cy - 2, 20, 4);
        // Flared ends
        ctx.fillRect(cx - 4, cy - 10, 8, 3);
        ctx.fillRect(cx - 4, cy + 7, 8, 3);
        ctx.fillRect(cx - 10, cy - 4, 3, 8);
        ctx.fillRect(cx + 7, cy - 4, 3, 8);

        // Subtle vignette
        const vignette = ctx.createRadialGradient(width / 2, height / 2, 12, width / 2, height / 2, 40);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.18)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
