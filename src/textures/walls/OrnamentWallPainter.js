import { TexturePainter } from '../TexturePainter.js';

export class OrnamentWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#8b0000');

        ctx.fillStyle = '#b8860b';
        ctx.fillRect(0, 0, width, 2);
        ctx.fillRect(0, height - 2, width, 2);
        ctx.fillRect(0, 0, 2, height);
        ctx.fillRect(width - 2, 0, 2, height);

        ctx.save();
        ctx.globalAlpha = 0.12;
        for (let x = 0; x < width; x += 6) {
            const wave = Math.sin(x * 0.3) * 2;
            ctx.fillStyle = x % 12 === 0 ? '#ffffff' : '#000000';
            ctx.fillRect(x, 0, 3, height + wave);
        }
        ctx.restore();

        ctx.fillStyle = '#f6f0e8';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.moveTo(32, 20);
        ctx.lineTo(24, 34);
        ctx.lineTo(29, 34);
        ctx.lineTo(24, 44);
        ctx.lineTo(32, 38);
        ctx.lineTo(40, 44);
        ctx.lineTo(35, 34);
        ctx.lineTo(40, 34);
        ctx.closePath();
        ctx.fill();

        const vignette = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, 40);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}

