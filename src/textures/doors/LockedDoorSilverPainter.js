import { DoorPainter } from './DoorPainter.js';

export class LockedDoorSilverPainter extends DoorPainter {
    paint(ctx, width, height) {
        super.paint(ctx, width, height);

        ctx.fillStyle = '#b9c0c8';
        ctx.fillRect(26, 24, 12, 12);
        ctx.fillStyle = '#d8dee4';
        ctx.fillRect(27, 25, 10, 2);
        ctx.fillStyle = '#23262a';
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

        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(37, 24, 1, 12);
        ctx.fillRect(26, 35, 12, 1);
    }
}

