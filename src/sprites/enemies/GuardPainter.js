import { SpritePainter } from '../SpritePainter.js';
import {
    buildDirectionalFrames,
    getMirroredDirection,
    isMirroredDirection,
    parseEnemyFrameKey,
} from './frameUtils.js';

export class GuardPainter extends SpritePainter {
    getFrames() {
        return buildDirectionalFrames('guard', 'Guard', { walk: 2, attack: 2, death: 2, pain: true });
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
        this.drawShadowEllipse(ctx, width / 2, height - 6, isRight ? (isDiagonal ? 11 : 10) : 13, 4, 0.18);

        const isAttack = state === 'attack';
        const isPain = state === 'pain';
        const isDeath = state === 'death';
        const isWalk = state === 'walk';
        // Original Wolf3D guard: warm tan-brown uniform
        const uniform = isPain ? '#d9c7c0' : '#7a5428';
        const bodyY = isDeath ? 34 + frameIndex * 4 : 18 + (isWalk && frameIndex === 1 ? 1 : 0) + (isRight ? 2 : 0);
        const bodyH = isDeath ? Math.max(8, 14 - frameIndex * 4) : (isRight ? (isDiagonal ? 21 : 20) : 22);
        const headY = isDeath ? 28 + frameIndex * 6 : 8;
        const leftLegOffset = isWalk ? (frameIndex === 0 ? -3 : 2) : 0;
        const rightLegOffset = isWalk ? (frameIndex === 0 ? 2 : -3) : 0;

        ctx.fillStyle = '#2b1a12';
        if (isRight) {
            ctx.fillRect(31, headY, 7, 3);
            ctx.fillStyle = '#d4a574';
            ctx.beginPath();
            ctx.ellipse(34, headY + 6, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(27, headY, 10, 3);
            ctx.fillStyle = isBack ? '#b28666' : '#d4a574';
            ctx.beginPath();
            ctx.ellipse(32, headY + 6, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = uniform;
        if (isRight) {
            ctx.fillRect(isDiagonal ? 25 : 26, bodyY, isDiagonal ? 14 : 12, bodyH);
        } else {
            ctx.beginPath();
            ctx.moveTo(23, bodyY);
            ctx.lineTo(41, bodyY);
            ctx.lineTo(38, bodyY + bodyH);
            ctx.lineTo(26, bodyY + bodyH);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = '#3d2b1f';
        if (isDeath) {
            ctx.fillRect(20, 44 + frameIndex * 2, 24, 5);
        } else {
            ctx.fillRect((isRight ? (isDiagonal ? 26 : 27) : 25) + leftLegOffset, 40, isRight ? 5 : 6, 14);
            ctx.fillRect((isRight ? (isDiagonal ? 34 : 33) : 33) + rightLegOffset, 40, isRight ? 5 : 6, 14);
        }

        if (!isBack && !isDeath) {
            this.drawLimb(ctx, (isRight ? (isDiagonal ? 23 : 24) : 19) + (isWalk ? rightLegOffset * 0.2 : 0), bodyY + 3, 4, 12, uniform);
            this.drawLimb(ctx, isAttack ? (isRight ? (isDiagonal ? 36 : 37) : 39) : (isRight ? (isDiagonal ? 38 : 37) : 41) + (isWalk ? leftLegOffset * 0.2 : 0), isAttack ? bodyY - frameIndex * 3 : bodyY + 3, 4, isAttack ? 14 : 12, uniform);
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(isAttack ? (isRight ? (isDiagonal ? 33 : 34) : 36) : (isRight ? (isDiagonal ? 35 : 34) : 40), isAttack ? bodyY - 3 - frameIndex * 2 : bodyY + 9, isRight ? 10 : 8, 3);
            if (isAttack && frameIndex === 1) {
                this.drawMuzzleFlash(ctx, isRight ? (isDiagonal ? 44 : 45) : 47, bodyY - 1, 5);
            }
        }

        if (!isRight && !isBack) {
            ctx.fillStyle = '#4e2f1f';
            ctx.fillRect(27, bodyY + 10, 10, 1);
            ctx.fillRect(29, bodyY + 5, 2, 2);
            ctx.fillRect(33, bodyY + 5, 2, 2);
        }
    }
}
