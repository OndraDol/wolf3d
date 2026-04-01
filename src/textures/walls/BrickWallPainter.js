import { TexturePainter } from '../TexturePainter.js';

export class BrickWallPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Dark brown mortar background
        this.clear(ctx, width, height, '#401808');

        const brickWidth = 16;
        const brickHeight = 8;
        const aoRects = [];

        for (let row = 0; row < 8; row++) {
            const y = row * brickHeight;
            const offset = row % 2 === 1 ? brickWidth / 2 : 0;

            for (let column = -1; column < 5; column++) {
                const x = (column * brickWidth) + offset;
                if (x <= -brickWidth || x >= width) {
                    continue;
                }

                // Vivid red bricks #A83020 to #C84030
                const baseColor = this.jitterColor('#B43028', 16, row * 31 + column * 17);
                const brickX = Math.max(0, x + 1);
                const brickY = y + 1;
                const brickW = Math.min(brickWidth - 1, width - brickX);
                const brickH = Math.min(brickHeight - 1, height - brickY);
                if (brickW <= 0 || brickH <= 0) {
                    continue;
                }

                this.drawBrick(ctx, brickX, brickY, brickW, brickH, baseColor, 0.18);
                aoRects.push({ x: brickX, y: brickY, w: brickW, h: brickH });
            }
        }

        this.addAmbientOcclusion(ctx, aoRects, 0.08);
        this.addSurfaceNoise(ctx, width, height, 4);
    }
}
