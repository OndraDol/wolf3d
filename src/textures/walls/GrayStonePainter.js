import { TexturePainter } from '../TexturePainter.js';

export class GrayStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#3d3d3d');

        let y = 0;
        let row = 0;
        while (y < height) {
            const blockHeight = Math.min(height - y, 14 + Math.floor(this.hash(row, 11, 1) * 12));
            let x = 0;
            let column = 0;
            while (x < width) {
                const blockWidth = Math.min(width - x, 16 + Math.floor(this.hash(column, row, 3) * 13));
                const color = this.jitterColor('#666666', 14, row * 31 + column * 23);
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), Math.max(1, blockHeight - 2));
                ctx.fillStyle = 'rgba(255,255,255,0.06)';
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), 1);
                ctx.fillStyle = 'rgba(0,0,0,0.16)';
                ctx.fillRect(x + 1, y + blockHeight - 2, Math.max(1, blockWidth - 2), 2);
                x += blockWidth;
                column++;
            }
            y += blockHeight;
            row++;
        }

        this.addSurfaceNoise(ctx, width, height, 4);
    }
}

