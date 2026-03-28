import { TexturePainter } from '../TexturePainter.js';

export class ElevatorSwitchPainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#2c3138');
        ctx.fillStyle = '#4e545b';
        ctx.fillRect(23, 18, 18, 28);
        ctx.fillStyle = '#7d848c';
        ctx.fillRect(25, 20, 14, 24);
        ctx.fillStyle = '#c04020';
        ctx.fillRect(28, 25, 8, 10);

        const glow = ctx.createRadialGradient(32, 40, 1, 32, 40, 6);
        glow.addColorStop(0, '#fff8b4');
        glow.addColorStop(1, 'rgba(240,208,80,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(32, 40, 6, 0, Math.PI * 2);
        ctx.fill();

        this.drawRivet(ctx, 25, 20, 1.6);
        this.drawRivet(ctx, 39, 20, 1.6);
        this.drawRivet(ctx, 25, 44, 1.6);
        this.drawRivet(ctx, 39, 44, 1.6);
    }
}

