import { TexturePainter } from '../TexturePainter.js';

export class ElevatorDoorPainter extends TexturePainter {
    paint(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#b0b0b0');
        gradient.addColorStop(1, '#5f5f5f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.fillRect(width / 2 - 1, 0, 2, height);

        ctx.fillStyle = '#48505a';
        ctx.fillRect(18, 16, 28, 16);
        ctx.fillStyle = '#f0d050';
        ctx.beginPath();
        ctx.moveTo(24, 26);
        ctx.lineTo(32, 18);
        ctx.lineTo(40, 26);
        ctx.lineTo(36, 26);
        ctx.lineTo(32, 22);
        ctx.lineTo(28, 26);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, 10, width, 1);
        ctx.fillRect(0, 22, width, 1);
        ctx.fillRect(0, 42, width, 1);

        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(0, height - 6, width, 6);
        this.addSurfaceNoise(ctx, width, height, 3);
    }
}

