import { TexturePainter } from '../TexturePainter.js';

export class GrayStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        // Medium dark gray mortar
        this.clear(ctx, width, height, '#404040');

        let y = 0;
        let row = 0;
        while (y < height) {
            const blockHeight = Math.min(height - y, 8 + Math.floor(this.hash(row, 11, 1) * 8));
            let x = 0;
            let column = 0;
            while (x < width) {
                const blockWidth = Math.min(width - x, 16 + Math.floor(this.hash(column, row, 3) * 16));
                // Medium gray blocks #808080 to #989898
                const color = this.jitterColor('#8C8C8C', 14, row * 31 + column * 23);
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), Math.max(1, blockHeight - 2));
                // Highlight top edge
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), 1);
                // Shadow bottom edge
                ctx.fillStyle = 'rgba(0,0,0,0.20)';
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
