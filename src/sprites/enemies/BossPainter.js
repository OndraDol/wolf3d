import { SpritePainter } from '../SpritePainter.js';
import {
    buildDirectionalFrames,
    getMirroredDirection,
    isMirroredDirection,
    parseEnemyFrameKey,
} from './frameUtils.js';

export class BossPainter extends SpritePainter {
    getFrames() {
        return buildDirectionalFrames('boss', 'Boss', { walk: 2, attack: 2, death: 2, pain: true });
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
        this.drawShadowEllipse(ctx, 32, 58, isRight ? (isDiagonal ? 14 : 13) : 16, 4, 0.2);

        const isAttack = state === 'attack';
        const isDeath = state === 'death';
        const isWalk = state === 'walk';
        const isPain = state === 'pain';
        // Original Wolf3D Hans Grosse: gray-green armor/uniform
        const uniform = isPain ? '#cfd4da' : '#506050';

        if (!isBack) {
            ctx.fillStyle = '#d2a07a';
            ctx.beginPath();
            ctx.ellipse(isRight ? 34 : 32, isDeath ? 22 : 12, isRight ? 5 : 6, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = uniform;
        if (isDeath) {
            ctx.fillRect(18, 30 + frameIndex * 3, 28, 10);
        } else {
            ctx.fillRect(isRight ? (isDiagonal ? 21 : 22) : 20, 18 + (isWalk && frameIndex === 1 ? 1 : 0), isRight ? (isDiagonal ? 22 : 20) : 24, 24);
        }

        this.drawArmorPlate(ctx, isRight ? (isDiagonal ? 23 : 24) : 23, isDeath ? 31 + frameIndex * 3 : 21, isRight ? (isDiagonal ? 18 : 16) : 18, 8, '#9ca3aa');

        if (!isBack) {
            ctx.fillStyle = '#51575e';
            ctx.fillRect(isRight ? (isDiagonal ? 17 : 18) : 14, isAttack ? 21 - frameIndex * 2 : 26, 10, 5);
            ctx.fillRect(isRight ? (isDiagonal ? 39 : 38) : 40, isAttack ? 21 - frameIndex * 2 : 26, 10, 5);
            if (isAttack && frameIndex === 1) {
                this.drawMuzzleFlash(ctx, isRight ? (isDiagonal ? 17 : 18) : 14, 24, 5);
                this.drawMuzzleFlash(ctx, isRight ? (isDiagonal ? 49 : 48) : 50, 24, 5);
            }
        }

        ctx.fillStyle = '#1f2328';
        if (!isDeath) {
            const step = isWalk ? (frameIndex === 0 ? 2 : -1) : 0;
            ctx.fillRect((isRight ? (isDiagonal ? 23 : 24) : 23) - step, 42, isRight ? 5 : 6, 13);
            ctx.fillRect((isRight ? (isDiagonal ? 36 : 35) : 35) + step, 42, isRight ? 5 : 6, 13);
        }
    }
}
