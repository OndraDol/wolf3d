import { TexturePainter } from '../TexturePainter.js';

export class MetalPanelPainter extends TexturePainter {
    paint(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#a8a8a8');
        gradient.addColorStop(0.45, '#858585');
        gradient.addColorStop(1, '#666666');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const panelRects = [
            { x: 8, y: 8, w: 20, h: 20 },
            { x: 36, y: 8, w: 20, h: 20 },
            { x: 12, y: 36, w: 40, h: 18 },
        ];

        for (const panel of panelRects) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 4;
            ctx.fillStyle = '#7c7c7c';
            ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
            ctx.restore();

            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(panel.x + 1, panel.y + 1, panel.w - 2, 1);
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(panel.x + 1, panel.y + panel.h - 2, panel.w - 2, 1);

            this.drawRivet(ctx, panel.x + 3, panel.y + 3, 2);
            this.drawRivet(ctx, panel.x + panel.w - 3, panel.y + 3, 2);
            this.drawRivet(ctx, panel.x + 3, panel.y + panel.h - 3, 2);
            this.drawRivet(ctx, panel.x + panel.w - 3, panel.y + panel.h - 3, 2);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(3, 0, 2, height);
        ctx.fillStyle = '#4a4a4a';
        for (let y = 14; y < height; y += 16) {
            ctx.fillRect(0, y, width, 1);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(0, 0, width, 4);
        ctx.fillRect(0, height - 4, width, 4);
        this.addSurfaceNoise(ctx, width, height, 3);
    }
}

