import { TexturePainter } from '../TexturePainter.js';

/**
 * Runtime compatibility painter for the current tile 7.
 * The active game still uses tile 7 for exit panels in level layouts.
 */
export class ElevatorExitPainter extends TexturePainter {
    paint(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#9aa2ac');
        gradient.addColorStop(1, '#59616b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#434951';
        ctx.fillRect(8, 8, width - 16, height - 16);
        ctx.fillStyle = '#7d848c';
        ctx.fillRect(12, 12, width - 24, height - 24);

        ctx.fillStyle = '#2c3138';
        ctx.fillRect(30, 8, 4, height - 16);

        ctx.fillStyle = '#d2b24a';
        for (let step = 0; step < 3; step++) {
            ctx.beginPath();
            ctx.moveTo(20, 18 + step * 12);
            ctx.lineTo(32, 24 + step * 12);
            ctx.lineTo(44, 18 + step * 12);
            ctx.lineTo(40, 18 + step * 12);
            ctx.lineTo(32, 22 + step * 12);
            ctx.lineTo(24, 18 + step * 12);
            ctx.closePath();
            ctx.fill();
        }

        this.drawRivet(ctx, 12, 12, 2);
        this.drawRivet(ctx, width - 12, 12, 2);
        this.drawRivet(ctx, 12, height - 12, 2);
        this.drawRivet(ctx, width - 12, height - 12, 2);
        this.addSurfaceNoise(ctx, width, height, 3);
    }
}

