import { TexturePainter } from '../TexturePainter.js';

export class CrackedStonePainter extends TexturePainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#303030');

        const occluders = [];
        let y = 0;
        let row = 0;
        while (y < height) {
            const blockHeight = Math.min(height - y, 14 + Math.floor(this.hash(row, 7, 1) * 11));
            let x = 0;
            let column = 0;

            while (x < width) {
                const blockWidth = Math.min(width - x, 15 + Math.floor(this.hash(column, row, 3) * 12));
                const color = this.jitterColor('#505050', 16, row * 37 + column * 29);
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), Math.max(1, blockHeight - 2));
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(x + 1, y + 1, Math.max(1, blockWidth - 2), 1);
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(x + 1, y + blockHeight - 2, Math.max(1, blockWidth - 2), 2);
                occluders.push({ x, y, w: blockWidth, h: blockHeight });
                x += blockWidth;
                column++;
            }

            y += blockHeight;
            row++;
        }

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(20,20,20,0.72)';

        const crackSeeds = [
            [[9, 4], [20, 16], [27, 29], [18, 44], [10, 58]],
            [[46, 6], [41, 18], [35, 27], [39, 40], [47, 56]],
            [[18, 34], [28, 30], [36, 22], [47, 16], [58, 10]],
        ];

        crackSeeds.forEach((points, index) => {
            ctx.lineWidth = index === 0 ? 2.6 : 2;
            ctx.beginPath();
            points.forEach(([px, py], pointIndex) => {
                if (pointIndex === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            });
            ctx.stroke();
        });

        ctx.strokeStyle = 'rgba(0,0,0,0.42)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(27, 29);
        ctx.lineTo(33, 39);
        ctx.lineTo(30, 50);
        ctx.moveTo(35, 27);
        ctx.lineTo(27, 36);
        ctx.stroke();
        ctx.restore();

        this.addSurfaceNoise(ctx, width, height, 6);
        this.addAmbientOcclusion(ctx, occluders, 0.12);
    }
}
