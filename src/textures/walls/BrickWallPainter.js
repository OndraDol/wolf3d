import { TexturePainter } from '../TexturePainter.js';

export class BrickWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#383838');

        const brickWidth = 8;
        const brickHeight = 16;
        const aoRects = [];

        for (let row = 0; row < 4; row++) {
            const y = row * brickHeight;
            const offset = row % 2 === 1 ? brickWidth / 2 : 0;

            for (let column = -1; column < 8; column++) {
                const x = (column * brickWidth) + offset;
                if (x <= -brickWidth || x >= width) {
                    continue;
                }

                const baseColor = this.jitterColor('#676767', 10, row * 31 + column * 17);
                const worn = this.hash(column, row, 7) > 0.82 ? this.adjustColor(baseColor, 0.14) : baseColor;
                const brickX = Math.max(0, x + 1);
                const brickY = y + 1;
                const brickW = Math.min(brickWidth - 1, width - brickX);
                const brickH = Math.min(brickHeight - 1, height - brickY);
                if (brickW <= 0 || brickH <= 0) {
                    continue;
                }

                this.drawBrick(ctx, brickX, brickY, brickW, brickH, worn, 0.16);
                aoRects.push({ x: brickX, y: brickY, w: brickW, h: brickH });
            }
        }

        this.addAmbientOcclusion(ctx, aoRects, 0.1);
        this.addSurfaceNoise(ctx, width, height, 5);
    }
}

