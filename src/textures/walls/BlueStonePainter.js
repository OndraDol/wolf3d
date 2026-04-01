import { TexturePainter } from '../TexturePainter.js';

export class BlueStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        // Dark blue mortar
        this.clear(ctx, width, height, '#1C1C40');

        let y = 0;
        let row = 0;
        while (y < height) {
            const blockHeight = Math.min(height - y, 8 + Math.floor(this.hash(row, 3, 2) * 8));
            let x = 0;
            let column = 0;

            while (x < width) {
                const blockWidth = Math.min(width - x, 16 + Math.floor(this.hash(column, row, 5) * 16));
                // Vivid blue blocks #384888 to #5868A8
                const shade = this.jitterColor('#485898', 16, row * 19 + column * 13);

                ctx.fillStyle = shade;
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), Math.max(1, blockHeight - 2));

                // Highlight top edge
                ctx.fillStyle = 'rgba(255,255,255,0.10)';
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), 1);
                // Shadow bottom edge
                ctx.fillStyle = 'rgba(0,0,0,0.20)';
                ctx.fillRect(x + 1, y + blockHeight - 2, Math.max(1, blockWidth - 2), 1);

                x += blockWidth;
                column++;
            }

            y += blockHeight;
            row++;
        }

        this.addSurfaceNoise(ctx, width, height, 5);
    }
}
