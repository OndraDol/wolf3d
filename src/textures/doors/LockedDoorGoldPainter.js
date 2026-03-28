import { DoorPainter } from './DoorPainter.js';

export class LockedDoorGoldPainter extends DoorPainter {
    paint(ctx, width, height) {
        super.paint(ctx, width, height);

        ctx.fillStyle = '#c9a227';
        ctx.fillRect(26, 24, 12, 12);
        ctx.fillStyle = '#f0d56e';
        ctx.fillRect(27, 25, 10, 2);
        ctx.fillStyle = '#2f2412';
        ctx.beginPath();
        ctx.moveTo(32, 28);
        ctx.lineTo(34, 28);
        ctx.lineTo(34, 30);
        ctx.lineTo(33, 31);
        ctx.lineTo(33, 34);
        ctx.lineTo(31, 34);
        ctx.lineTo(31, 31);
        ctx.lineTo(30, 30);
        ctx.lineTo(30, 28);
        ctx.closePath();
        ctx.fill();

        this.drawRivet(ctx, 28, 26, 1.8);
        this.drawRivet(ctx, 36, 26, 1.8);
        this.drawRivet(ctx, 28, 34, 1.8);
        this.drawRivet(ctx, 36, 34, 1.8);
    }
}

