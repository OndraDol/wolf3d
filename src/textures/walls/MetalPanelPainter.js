import { TexturePainter } from '../TexturePainter.js';

/**
 * Tile 5 — Metal/steel panel wall — exact copy of original Wolf3D.
 * Original: blue-gray industrial metal panels with rivets and seam lines.
 * Color: VGA steel gray-blue ~RGB(112-148, 112-148, 120-156).
 */
export class MetalPanelPainter extends TexturePainter {
    paint(ctx, width, height) {
        // Base steel color
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#8890a0');
        gradient.addColorStop(0.5, '#707888');
        gradient.addColorStop(1, '#606870');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Main recessed panel (original has inset plate)
        ctx.fillStyle = '#586068';
        ctx.fillRect(4, 4, width - 8, height - 8);

        // Panel highlight (top-left)
        ctx.fillStyle = '#a0a8b8';
        ctx.fillRect(4, 4, width - 8, 1);
        ctx.fillRect(4, 4, 1, height - 8);

        // Panel shadow (bottom-right)
        ctx.fillStyle = '#384048';
        ctx.fillRect(4, height - 5, width - 8, 1);
        ctx.fillRect(width - 5, 4, 1, height - 8);

        // Horizontal seam lines (original has visible panel joins)
        ctx.fillStyle = '#384048';
        ctx.fillRect(4, 21, width - 8, 1);
        ctx.fillRect(4, 42, width - 8, 1);
        ctx.fillStyle = '#8890a0';
        ctx.fillRect(4, 22, width - 8, 1);
        ctx.fillRect(4, 43, width - 8, 1);

        // Rivets at panel corners (original has clear rivet pattern)
        this.drawRivet(ctx, 8, 8, 2);
        this.drawRivet(ctx, width - 8, 8, 2);
        this.drawRivet(ctx, 8, height - 8, 2);
        this.drawRivet(ctx, width - 8, height - 8, 2);
        // Center column rivets
        this.drawRivet(ctx, 8, 32, 2);
        this.drawRivet(ctx, width - 8, 32, 2);

        // Outer frame dark border
        ctx.fillStyle = '#303840';
        ctx.fillRect(0, 0, width, 2);
        ctx.fillRect(0, height - 2, width, 2);
        ctx.fillRect(0, 0, 2, height);
        ctx.fillRect(width - 2, 0, 2, height);
        // Frame highlight
        ctx.fillStyle = '#a0a8b0';
        ctx.fillRect(0, 0, width, 1);
        ctx.fillRect(0, 0, 1, height);

        this.addSurfaceNoise(ctx, width, height, 2);
    }
}
