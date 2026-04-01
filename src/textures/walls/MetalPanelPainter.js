import { TexturePainter } from '../TexturePainter.js';

export class MetalPanelPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Blue-gray steel gradient #708090 to #8898A8
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#8898A8');
        gradient.addColorStop(0.5, '#7888A0');
        gradient.addColorStop(1, '#708090');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Recessed panels
        const panelRects = [
            { x: 8, y: 8, w: 20, h: 20 },
            { x: 36, y: 8, w: 20, h: 20 },
            { x: 12, y: 36, w: 40, h: 18 },
        ];

        for (const panel of panelRects) {
            // Shadow edge (recessed look)
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(panel.x, panel.y, panel.w, 1);
            ctx.fillRect(panel.x, panel.y, 1, panel.h);

            // Panel face
            ctx.fillStyle = '#6878888';
            ctx.fillStyle = '#687888';
            ctx.fillRect(panel.x + 1, panel.y + 1, panel.w - 2, panel.h - 2);

            // Highlight bottom-right (recessed)
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(panel.x + 1, panel.y + panel.h - 1, panel.w - 1, 1);
            ctx.fillRect(panel.x + panel.w - 1, panel.y + 1, 1, panel.h - 1);

            // Rivets in corners
            this.drawRivet(ctx, panel.x + 3, panel.y + 3, 2);
            this.drawRivet(ctx, panel.x + panel.w - 3, panel.y + 3, 2);
            this.drawRivet(ctx, panel.x + 3, panel.y + panel.h - 3, 2);
            this.drawRivet(ctx, panel.x + panel.w - 3, panel.y + panel.h - 3, 2);
        }

        // Vertical highlight strip
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(3, 0, 2, height);

        // Horizontal lines for texture
        ctx.fillStyle = '#506070';
        for (let y = 14; y < height; y += 16) {
            ctx.fillRect(0, y, width, 1);
        }

        // Edge darkening
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, 0, width, 4);
        ctx.fillRect(0, height - 4, width, 4);
        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
