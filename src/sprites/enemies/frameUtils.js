export const ENEMY_DIRECTIONS = [
    'front',
    'front-right',
    'right',
    'back-right',
    'back',
    'back-left',
    'left',
    'front-left',
];

const DIRECTION_TO_ANGLE = new Map(
    ENEMY_DIRECTIONS.map((direction, index) => [
        direction,
        index <= 4 ? index * (Math.PI / 4) : (index - ENEMY_DIRECTIONS.length) * (Math.PI / 4),
    ])
);

export function normalizeAngle(angle) {
    let value = angle;
    while (value <= -Math.PI) {
        value += Math.PI * 2;
    }
    while (value > Math.PI) {
        value -= Math.PI * 2;
    }
    return value;
}

export function selectFacingDirection(deltaAngle, previousDirection = null, hysteresis = Math.PI / 18) {
    const normalized = normalizeAngle(deltaAngle);
    const candidateIndex = (Math.round(normalized / (Math.PI / 4)) + ENEMY_DIRECTIONS.length) % ENEMY_DIRECTIONS.length;
    const candidate = ENEMY_DIRECTIONS[candidateIndex];

    if (!previousDirection || !DIRECTION_TO_ANGLE.has(previousDirection)) {
        return candidate;
    }

    const previousCenter = DIRECTION_TO_ANGLE.get(previousDirection);
    const previousOffset = Math.abs(normalizeAngle(normalized - previousCenter));
    const stickyThreshold = (Math.PI / 8) + hysteresis;

    return previousOffset <= stickyThreshold ? previousDirection : candidate;
}

export function buildDirectionalFrames(prefix, label, counts = {}) {
    const walkCount = counts.walk ?? 0;
    const attackCount = counts.attack ?? 0;
    const deathCount = counts.death ?? 0;
    const includePain = counts.pain ?? true;
    const frames = [];

    for (const direction of ENEMY_DIRECTIONS) {
        frames.push({ key: `${prefix}_stand_${direction}_0`, label: `${label} Stand ${direction}` });
        for (let frame = 0; frame < walkCount; frame++) {
            frames.push({ key: `${prefix}_walk_${direction}_${frame}`, label: `${label} Walk ${direction} ${frame}` });
        }
        for (let frame = 0; frame < attackCount; frame++) {
            frames.push({ key: `${prefix}_attack_${direction}_${frame}`, label: `${label} Attack ${direction} ${frame}` });
        }
        if (includePain) {
            frames.push({ key: `${prefix}_pain_${direction}_0`, label: `${label} Pain ${direction}` });
        }
        for (let frame = 0; frame < deathCount; frame++) {
            frames.push({ key: `${prefix}_death_${direction}_${frame}`, label: `${label} Death ${direction} ${frame}` });
        }
    }

    return frames;
}

export function parseEnemyFrameKey(key) {
    const parts = key.split('_');
    return {
        prefix: parts[0],
        state: parts[1],
        direction: parts[2],
        frameIndex: Number.parseInt(parts.at(-1), 10) || 0,
    };
}

export function getMirroredDirection(direction) {
    switch (direction) {
        case 'left':
            return 'right';
        case 'front-left':
            return 'front-right';
        case 'back-left':
            return 'back-right';
        default:
            return direction;
    }
}

export function isMirroredDirection(direction) {
    return direction === 'left' || direction === 'front-left' || direction === 'back-left';
}
