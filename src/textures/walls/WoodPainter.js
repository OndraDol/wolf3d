import { TexturePainter } from '../TexturePainter.js';

export class WoodPainter extends TexturePainter {
    paint(ctx, width, height) {
        this.drawWoodGrain(ctx, width, height, '#6b4226', '#8a5a34');

        for (let x = 0; x < width; x += 8) {
            const plankColor = this.jitterColor('#6b4226', 10, x * 3);
            ctx.fillStyle = plankColor;
            ctx.fillRect(x, 0, 7, height);

            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(x, 0, 1, height);
            ctx.fillStyle = '#3b2415';
            ctx.fillRect(Math.min(width - 1, x + 7), 0, 1, height);

            if (this.hash(x, width, 17) > 0.72) {
                const knotY = 10 + Math.floor(this.hash(x, 4, 21) * (height - 20));
                ctx.fillStyle = '#4a2816';
                ctx.beginPath();
                ctx.ellipse(x + 4, knotY, 2.5, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.beginPath();
                ctx.ellipse(x + 3, knotY - 1, 1.3, 2.2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = '#a06d42';
        ctx.lineWidth = 1;
        for (let band = 4; band < height; band += 6) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 2) {
                const wave = Math.sin((x * 0.18) + (band * 0.2)) * 1.4;
                if (x === 0) {
                    ctx.moveTo(x, band + wave);
                } else {
                    ctx.lineTo(x, band + wave);
                }
            }
            ctx.stroke();
        }
        ctx.restore();

        this.addSurfaceNoise(ctx, width, height, 4);
    }
}

