import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 3 — Wood panel wall — exact copy of original Wolf3D.
 * Original: "Wood with Beige Trim". Vertical planks ~10px wide,
 * beige/tan color (VGA ~140-168, 100-116, 56-72), dark groove lines
 * between planks, two horizontal dark metal bands.
 */
export class WoodPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Base wood color
        this.clear(ctx, width, height, '#6a4a2a');

        const plankW = 10;

        // Draw vertical planks
        for (let i = 0; i < Math.ceil(width / plankW); i++) {
            const x = i * plankW;
            const v = this.hash(i, 0, 3);
            const r = 144 + Math.floor(v * 28);
            const g = 100 + Math.floor(v * 20);
            const b = 56 + Math.floor(v * 16);

            // Plank face
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x + 1, 0, plankW - 2, height);

            // Left edge highlight
            ctx.fillStyle = `rgb(${Math.min(255, r + 20)},${Math.min(255, g + 14)},${Math.min(255, b + 10)})`;
            ctx.fillRect(x + 1, 0, 1, height);

            // Right edge dark groove
            ctx.fillStyle = `rgb(${Math.max(0, r - 48)},${Math.max(0, g - 36)},${Math.max(0, b - 24)})`;
            ctx.fillRect(x + plankW - 1, 0, 1, height);
            // Dark mortar line
            ctx.fillStyle = '#2a1c0c';
            ctx.fillRect(x, 0, 1, height);

            // Subtle wood grain lines
            ctx.save();
            ctx.globalAlpha = 0.12;
            ctx.strokeStyle = `rgb(${r + 20},${g + 10},${b + 6})`;
            ctx.lineWidth = 1;
            for (let gy = 3; gy < height; gy += 4) {
                const wave = Math.sin((x * 0.15) + (gy * 0.2) + i * 2.3) * 0.8;
                ctx.beginPath();
                ctx.moveTo(x + 2, gy + wave);
                ctx.lineTo(x + plankW - 2, gy + wave);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Horizontal metal bands (original Wolf3D "beige trim" = dark horizontal strips)
        const bandColor = '#3a2810';
        const bandHi = '#5a4020';
        ctx.fillStyle = bandColor;
        ctx.fillRect(0, 20, width, 4);
        ctx.fillRect(0, 42, width, 4);
        // Band highlight
        ctx.fillStyle = bandHi;
        ctx.fillRect(0, 20, width, 1);
        ctx.fillRect(0, 42, width, 1);
        // Band shadow
        ctx.fillStyle = '#1a1008';
        ctx.fillRect(0, 23, width, 1);
        ctx.fillRect(0, 45, width, 1);

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
