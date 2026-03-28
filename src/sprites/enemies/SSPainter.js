import { SpritePainter } from '../SpritePainter.js';
import {
    buildDirectionalFrames,
    getMirroredDirection,
    isMirroredDirection,
    parseEnemyFrameKey,
} from './frameUtils.js';

export class SSPainter extends SpritePainter {
    getFrames() {
        return buildDirectionalFrames('officer', 'Officer', { walk: 2, attack: 2, death: 2, pain: true });
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
        this.drawShadowEllipse(ctx, 32, 58, isRight ? (isDiagonal ? 11 : 10) : 13, 4, 0.18);

        const isAttack = state === 'attack';
        const isPain = state === 'pain';
        const isWalk = state === 'walk';
        const isDeath = state === 'death';
        const uniform = isPain ? '#cfd9e6' : '#1a3a5c';
        const stepOffset = isWalk ? (frameIndex === 0 ? 3 : -2) : 0;

        ctx.fillStyle = '#4e5661';
        ctx.beginPath();
        ctx.arc(isRight ? 34 : 32, isDeath ? 18 : 13, isRight ? 5 : 6, Math.PI, Math.PI * 2);
        ctx.fill();
        if (!isBack) {
            ctx.fillStyle = '#d2a07a';
            ctx.beginPath();
            ctx.ellipse(isRight ? 34 : 32, isDeath ? 22 : 16, isRight ? 4 : 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = uniform;
        if (isDeath) {
            ctx.fillRect(21, 34 + frameIndex * 3, 22, 10);
        } else {
            ctx.fillRect(isRight ? (isDiagonal ? 25 : 26) : 24, 18, isRight ? (isDiagonal ? 14 : 12) : 16, 23);
            if (!isBack && !isRight) {
                ctx.fillRect(26, 21, 2, 2);
                ctx.fillRect(36, 21, 2, 2);
            }
            if (!isBack) {
                ctx.fillRect(isRight ? (isDiagonal ? 23 : 24) : 20, 22, 4, 13);
                ctx.fillRect(isRight ? (isDiagonal ? 39 : 38) : 40, isAttack ? 18 - frameIndex * 2 : 22, 4, isAttack ? 17 : 13);
            }
        }

        ctx.fillStyle = '#22252a';
        if (!isDeath) {
            ctx.fillRect((isRight ? (isDiagonal ? 26 : 27) : 25) - stepOffset, 41, isRight ? 5 : 6, 14);
            ctx.fillRect((isRight ? (isDiagonal ? 34 : 33) : 33) + stepOffset, 41, isRight ? 5 : 6, 14);
        }

        if (!isBack) {
            ctx.fillStyle = '#35393f';
            ctx.fillRect(isDeath ? 35 : (isRight ? (isDiagonal ? 35 : 34) : 33), isAttack ? 18 - frameIndex * 2 : 28, 12, 4);
            if (isAttack && frameIndex === 1) {
                this.drawMuzzleFlash(ctx, isRight ? (isDiagonal ? 45 : 46) : 47, 20, 5, '#f7f0cc', '#ffd05a');
            }
        }
    }
}
