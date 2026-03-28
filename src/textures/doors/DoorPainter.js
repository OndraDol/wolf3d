import { TexturePainter } from '../TexturePainter.js';

export class DoorPainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#4a2e1a');

        for (let x = 6; x < width - 6; x += 12) {
            ctx.fillStyle = this.jitterColor('#6b4226', 9, x * 5);
            ctx.fillRect(x, 6, 10, height - 12);
            ctx.fillStyle = 'rgba(255,255,255,0.09)';
            ctx.fillRect(x, 6, 1, height - 12);
            ctx.fillStyle = '#3b2415';
            ctx.fillRect(x + 10, 6, 1, height - 12);
        }

        ctx.fillStyle = '#6e6e6e';
        ctx.fillRect(12, 29, width - 24, 6);
        ctx.fillStyle = '#d2d8de';
        ctx.fillRect(14, 30, width - 28, 1);

        ctx.fillStyle = '#c2a15a';
        ctx.beginPath();
        ctx.arc(width - 14, 32, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(width - 17, 31, 7, 2);

        ctx.fillStyle = '#4a2e1a';
        ctx.fillRect(0, 0, width, 6);
        ctx.fillRect(0, height - 6, width, 6);
    }
}

