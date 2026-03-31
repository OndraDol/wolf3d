import { SpritePainter } from '../SpritePainter.js';
import {
    buildDirectionalFrames,
    getMirroredDirection,
    isMirroredDirection,
    parseEnemyFrameKey,
} from './frameUtils.js';

export class CommanderPainter extends SpritePainter {
    getFrames() {
        return buildDirectionalFrames('commander', 'Commander', { walk: 2, attack: 2, death: 2, pain: true });
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
        this.drawShadowEllipse(ctx, 32, 58, isRight ? (isDiagonal ? 13 : 12) : 15, 4, 0.2);

        const isAttack = state === 'attack';
        const isPain = state === 'pain';
        const isWalk = state === 'walk';
        const isDeath = state === 'death';
        // Original Wolf3D officer: white/light gray uniform
        const uniform = isPain ? '#f0dada' : '#d8d0c0';

        ctx.fillStyle = '#f0d8c0';
        if (!isBack) {
            ctx.beginPath();
            ctx.ellipse(isRight ? 34 : 32, isDeath ? 21 : 12, isRight ? 5 : 6, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#2a1c1c';
        ctx.fillRect(isRight ? 30 : 27, isDeath ? 16 : 7, isRight ? 8 : 10, 3);

        ctx.fillStyle = uniform;
        if (isDeath) {
            ctx.fillRect(18, 34 + frameIndex * 2, 28, 10);
        } else {
            ctx.fillRect(isRight ? (isDiagonal ? 23 : 24) : 22, 18 + (isWalk && frameIndex === 1 ? 1 : 0), isRight ? (isDiagonal ? 18 : 16) : 20, 24);
            if (!isBack) {
                ctx.fillRect(isRight ? (isDiagonal ? 20 : 21) : 18, 22, 4, 18);
                ctx.fillRect(isRight ? (isDiagonal ? 41 : 40) : 42, 22 - (isAttack ? frameIndex * 2 : 0), 4, 18 + (isAttack ? frameIndex * 2 : 0));
            }
        }

        if (!isBack) {
            ctx.fillStyle = '#cba648';
            ctx.fillRect(25, isAttack ? 28 - frameIndex * 2 : 30, isRight ? (isDiagonal ? 18 : 16) : 18, 6);
        }

        ctx.fillStyle = '#241b26';
        if (!isDeath) {
            const step = isWalk ? (frameIndex === 0 ? 2 : -2) : 0;
            ctx.fillRect((isRight ? (isDiagonal ? 24 : 25) : 24) - step, 42, isRight ? 5 : 6, 13);
            ctx.fillRect((isRight ? (isDiagonal ? 35 : 34) : 34) + step, 42, isRight ? 5 : 6, 13);
        }

        if (!isBack && isAttack && frameIndex === 1) {
            this.drawMuzzleFlash(ctx, isRight ? (isDiagonal ? 44 : 45) : 46, 29, 5, '#fff4c2', '#f0c048');
        }
    }
}
