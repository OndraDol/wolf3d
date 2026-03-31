import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 5 — Metal panel wall (faithful to original Wolf3D).
 * Blue-gray industrial metal with recessed panels and rivets.
 */
export class MetalPanelPainter extends TexturePainter {
    paint(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#8a90a0');
        gradient.addColorStop(0.45, '#707888');
        gradient.addColorStop(1, '#585e6e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Main recessed panel
        ctx.fillStyle = '#5a6070';
        ctx.fillRect(6, 6, width - 12, height - 12);
        // Panel inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(7, 7, width - 14, 1);
        ctx.fillRect(7, 7, 1, height - 14);
        // Panel inner shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(7, height - 8, width - 14, 1);
        ctx.fillRect(width - 8, 7, 1, height - 14);

        // Horizontal seam lines
        ctx.fillStyle = '#3a4050';
        ctx.fillRect(6, Math.floor(height / 3), width - 12, 1);
        ctx.fillRect(6, Math.floor(height * 2 / 3), width - 12, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(6, Math.floor(height / 3) + 1, width - 12, 1);
        ctx.fillRect(6, Math.floor(height * 2 / 3) + 1, width - 12, 1);

        // Corner rivets
        this.drawRivet(ctx, 10, 10, 2);
        this.drawRivet(ctx, width - 10, 10, 2);
        this.drawRivet(ctx, 10, height - 10, 2);
        this.drawRivet(ctx, width - 10, height - 10, 2);
        // Center rivets
        this.drawRivet(ctx, 10, height / 2, 2);
        this.drawRivet(ctx, width - 10, height / 2, 2);

        // Outer frame
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.fillRect(0, 0, width, 3);
        ctx.fillRect(0, height - 3, width, 3);
        ctx.fillRect(0, 0, 3, height);
        ctx.fillRect(width - 3, 0, 3, height);

        this.addSurfaceNoise(ctx, width, height, 3);
    }
}
