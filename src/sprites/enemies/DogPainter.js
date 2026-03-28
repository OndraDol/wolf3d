import { SpritePainter } from '../SpritePainter.js';
import {
    buildDirectionalFrames,
    getMirroredDirection,
    isMirroredDirection,
    parseEnemyFrameKey,
} from './frameUtils.js';

export class DogPainter extends SpritePainter {
    getFrames() {
        return buildDirectionalFrames('dog', 'Dog', { walk: 2, attack: 2, death: 2, pain: false });
    }

    paintFrame(ctx, width, height, key) {
        const { direction, state, frameIndex } = parseEnemyFrameKey(key);
        if (isMirroredDirection(direction)) {
            this.clear(ctx, width, height);
            this.mirrorFrame(ctx, width, height, () => this.paintFrame(ctx, width, height, key.replace(`_${direction}_`, `_${getMirroredDirection(direction)}_`)));
            return;
        }

        this.clear(ctx, width, height);
        const isBack = direction === 'back' || direction === 'back-right';
        const isRight = direction === 'right' || direction === 'front-right' || direction === 'back-right';
        const isDiagonal = direction === 'front-right' || direction === 'back-right';
        this.drawShadowEllipse(ctx, 31, 52, isRight ? (isDiagonal ? 13 : 12) : 15, 4, 0.18);

        const isAttack = state === 'attack';
        const isDeath = state === 'death';
        const isWalk = state === 'walk';
        const step = isWalk ? (frameIndex === 0 ? 2 : -2) : 0;

        ctx.fillStyle = '#6a4a2b';
        if (isDeath) {
            ctx.beginPath();
            ctx.ellipse(30, 40 + frameIndex * 2, 16, 8, -0.18, 0, Math.PI * 2);
            ctx.fill();
        } else {
            if (isRight) {
                ctx.beginPath();
                ctx.ellipse(isDiagonal ? 30 : 29, 34, isDiagonal ? 14 : 13, 7, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (isBack) {
                ctx.beginPath();
                ctx.ellipse(32, 34, 15, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.ellipse(30, 34, 15, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = '#1f1a17';
        ctx.beginPath();
        ctx.ellipse(isBack ? 18 : (isRight ? (isDiagonal ? 42 : 41) + (isAttack ? frameIndex * 2 : 0) : 43 + (isAttack ? frameIndex * 2 : 0)), isDeath ? 39 : 32, isRight ? 5 : 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isAttack) {
            ctx.fillStyle = '#b95e6a';
            ctx.beginPath();
            const muzzleX = isRight ? 45 + frameIndex * 2 : 47 + frameIndex * 2;
            ctx.moveTo(muzzleX, 35);
            ctx.lineTo(muzzleX + 6, 37);
            ctx.lineTo(muzzleX, 39);
            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = '#1f1a17';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(isBack ? 48 : 15, 31);
        ctx.lineTo(isBack ? 53 : 10, 28 + (isWalk ? frameIndex : 0));
        ctx.stroke();

        if (!isDeath) {
            ctx.fillStyle = '#1f1a17';
            ctx.fillRect((isRight ? 17 : 18) - step, 39, 3, 12);
            ctx.fillRect((isRight ? 24 : 26) + step, 39, 3, 12);
            ctx.fillRect((isRight ? 31 : 34) - step, 39, 3, 12);
            ctx.fillRect((isRight ? 38 : 42) + step, 39, 3, 12);
        }
    }
}
