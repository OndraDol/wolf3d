import { TexturePainter } from '../TexturePainter.js';

export class BlueStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#1a1a3a');

        let y = 0;
        let row = 0;
        while (y < height) {
            const blockHeight = Math.min(height - y, 10 + Math.floor(this.hash(row, 3, 2) * 9));
            let x = 0;
            let column = 0;

            while (x < width) {
                const blockWidth = Math.min(width - x, 10 + Math.floor(this.hash(column, row, 5) * 13));
                const seamOffsetX = Math.round((this.hash(column, row, 8) * 2) - 1);
                const seamOffsetY = Math.round((this.hash(column, row, 9) * 2) - 1);
                const blockX = Math.max(0, x + seamOffsetX);
                const blockY = Math.max(0, y + seamOffsetY);
                const shade = this.jitterColor('#394678', 12, row * 19 + column * 13);

                ctx.fillStyle = shade;
                ctx.fillRect(blockX + 1, blockY + 1, Math.max(1, blockWidth - 2), Math.max(1, blockHeight - 2));

                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fillRect(blockX + 1, blockY + 1, Math.max(1, blockWidth - 2), 1);
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.fillRect(blockX + 1, blockY + blockHeight - 2, Math.max(1, blockWidth - 2), 1);

                x += blockWidth;
                column++;
            }

            y += blockHeight;
            row++;
        }

        for (let stripe = 0; stripe < 4; stripe++) {
            ctx.fillStyle = stripe % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
            ctx.fillRect(0, stripe * 16, width, 8);
        }

        this.addSurfaceNoise(ctx, width, height, 6);
    }
}

