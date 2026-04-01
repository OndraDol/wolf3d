import { TexturePainter } from '../TexturePainter.js';

export class WoodPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Warm tan/brown wood base
        this.drawWoodGrain(ctx, width, height, '#906838', '#A87848');

        const plankWidth = 8;
        for (let x = 0; x < width; x += plankWidth) {
            // Planks #906838 to #A87848
            const plankColor = this.jitterColor('#9C7040', 12, x * 3);
            ctx.fillStyle = plankColor;
            ctx.fillRect(x, 0, plankWidth - 1, height);

            // Light edge highlight
            ctx.fillStyle = 'rgba(255,255,255,0.10)';
            ctx.fillRect(x, 0, 1, height);
            // Dark groove between planks
            ctx.fillStyle = '#483018';
            ctx.fillRect(Math.min(width - 1, x + plankWidth - 1), 0, 1, height);

            // Wood knots
            if (this.hash(x, width, 17) > 0.72) {
                const knotY = 10 + Math.floor(this.hash(x, 4, 21) * (height - 20));
                ctx.fillStyle = '#5A3010';
                ctx.beginPath();
                ctx.ellipse(x + 4, knotY, 2.5, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.beginPath();
                ctx.ellipse(x + 3, knotY - 1, 1.3, 2.2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Horizontal metal bands at 1/3 and 2/3 height
        const bandColor = '#707070';
        const bandHighlight = 'rgba(255,255,255,0.20)';
        const bandShadow = 'rgba(0,0,0,0.25)';
        for (const bandY of [Math.floor(height / 3), Math.floor(height * 2 / 3)]) {
            ctx.fillStyle = bandColor;
            ctx.fillRect(0, bandY, width, 3);
            ctx.fillStyle = bandHighlight;
            ctx.fillRect(0, bandY, width, 1);
            ctx.fillStyle = bandShadow;
            ctx.fillRect(0, bandY + 2, width, 1);
            // Rivets on bands
            this.drawRivet(ctx, 8, bandY + 1, 1.5);
            this.drawRivet(ctx, 24, bandY + 1, 1.5);
            this.drawRivet(ctx, 40, bandY + 1, 1.5);
            this.drawRivet(ctx, 56, bandY + 1, 1.5);
        }

        // Subtle wood grain lines
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = '#B08050';
        ctx.lineWidth = 1;
        for (let band = 4; band < height; band += 6) {
            ctx.beginPath();
            for (let gx = 0; gx <= width; gx += 2) {
                const wave = Math.sin((gx * 0.18) + (band * 0.2)) * 1.4;
                if (gx === 0) {
                    ctx.moveTo(gx, band + wave);
                } else {
                    ctx.lineTo(gx, band + wave);
                }
            }
            ctx.stroke();
        }
        ctx.restore();

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
