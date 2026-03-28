import { TexturePainter } from '../TexturePainter.js';

export class PrisonBarsPainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#4a4a4a');
        ctx.fillStyle = '#5e5e5e';
        ctx.fillRect(6, 18, width - 12, 4);
        ctx.fillRect(6, 42, width - 12, 4);

        for (let x = 10; x < width; x += 10) {
            const barColor = this.jitterColor('#7a7a7a', 8, x * 9);
            ctx.fillStyle = barColor;
            ctx.fillRect(x, 6, 4, height - 12);
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(x, 6, 1, height - 12);
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.fillRect(x + 3, 6, 1, height - 12);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, 0, width, height);
        this.addSurfaceNoise(ctx, width, height, 4);
    }
}

