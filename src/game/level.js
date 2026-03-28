/**
 * Level definitions and lightweight runtime loading.
 * Level data are the single source of truth for map layout, spawn points and entities.
 */

const TILE_SYMBOLS = {
    '.': 0,
    '#': 1,
    '%': 2,
    '+': 3,
    '&': 4,
    '=': 5,
    '!': 6,
    E: 7,
    '|': 8,
};

const DOOR_SYMBOLS = {
    D: { tile: 64, lock: 'none' },
    G: { tile: 65, lock: 'gold' },
    S: { tile: 66, lock: 'silver' },
};

const PLAYER_SYMBOLS = {
    '^': -Math.PI / 2,
    '>': 0,
    v: Math.PI / 2,
    '<': Math.PI,
};

function clonePoint(point) {
    return { x: point.x, y: point.y };
}

function normalizeEntity(entity, index) {
    return {
        id: entity.id ?? `entity-${index}`,
        type: entity.type ?? 'guard',
        x: entity.x,
        y: entity.y,
        angle: entity.angle ?? 0,
        patrolPoints: entity.patrolPoints?.map(clonePoint) ?? [{ x: entity.x, y: entity.y }],
    };
}

function normalizePickup(pickup, index) {
    return {
        id: pickup.id ?? `pickup-${index}`,
        type: pickup.type ?? 'ammo',
        x: pickup.x,
        y: pickup.y,
        amount: pickup.amount ?? 1,
        value: pickup.value ?? 0,
        label: pickup.label ?? '',
    };
}

function normalizeProp(prop, index) {
    return {
        id: prop.id ?? `prop-${index}`,
        type: prop.type ?? 'barrel',
        x: prop.x,
        y: prop.y,
        scale: prop.scale ?? 1,
    };
}

function normalizeSecret(secret, index) {
    return {
        id: secret.id ?? `secret-${index}`,
        x: secret.x,
        y: secret.y,
        radius: secret.radius ?? 0.45,
        title: secret.title ?? 'SECRET FOUND',
        message: secret.message ?? 'Hidden cache discovered.',
        value: secret.value ?? 150,
    };
}

function createLevel(definition) {
    const rows = definition.layout.map((row) => row.trimEnd());
    const width = rows[0].length;
    const height = rows.length;
    const tiles = new Array(height);
    const doors = [];
    let playerStart = null;
    let exit = null;

    for (let y = 0; y < height; y++) {
        const row = rows[y];
        if (row.length !== width) {
            throw new Error(`Invalid level "${definition.id}": row ${y} has inconsistent width.`);
        }

        tiles[y] = new Array(width);
        for (let x = 0; x < width; x++) {
            const symbol = row[x];

            if (symbol in TILE_SYMBOLS) {
                tiles[y][x] = TILE_SYMBOLS[symbol];
                if (symbol === 'E') {
                    exit = {
                        x: x + 0.5,
                        y: y + 0.5,
                        kind: 'elevator',
                        facing: definition.exit?.facing ?? 'east',
                    };
                }
                continue;
            }

            if (symbol in DOOR_SYMBOLS) {
                const spec = DOOR_SYMBOLS[symbol];
                tiles[y][x] = spec.tile;
                doors.push({
                    x,
                    y,
                    tile: spec.tile,
                    lock: spec.lock,
                });
                continue;
            }

            if (symbol in PLAYER_SYMBOLS) {
                tiles[y][x] = 0;
                playerStart = {
                    x: x + 0.5,
                    y: y + 0.5,
                    angle: PLAYER_SYMBOLS[symbol],
                };
                continue;
            }

            throw new Error(`Invalid symbol "${symbol}" in level "${definition.id}" at ${x},${y}.`);
        }
    }

    if (!playerStart) {
        throw new Error(`Invalid level "${definition.id}": missing player start.`);
    }

    return {
        id: definition.id,
        name: definition.name,
        nextLevelId: definition.nextLevelId ?? null,
        width,
        height,
        meta: { ...(definition.meta ?? {}) },
        metadata: { ...(definition.metadata ?? {}) },
        tiles,
        playerStart,
        doors,
        entities: (definition.entities ?? []).map(normalizeEntity),
        pickups: (definition.pickups ?? []).map(normalizePickup),
        props: (definition.props ?? []).map(normalizeProp),
        secrets: (definition.secrets ?? []).map(normalizeSecret),
        exit: exit ? { ...exit, ...(definition.exit ?? {}) } : definition.exit ? { ...definition.exit } : null,
    };
}

function cloneLevel(level) {
    return {
        ...level,
        meta: { ...level.meta },
        metadata: { ...level.metadata },
        playerStart: { ...level.playerStart },
        nextLevelId: level.nextLevelId,
        doors: level.doors.map((door) => ({ ...door })),
        entities: level.entities.map((entity) => ({
            ...entity,
            patrolPoints: entity.patrolPoints.map(clonePoint),
        })),
        pickups: level.pickups.map((pickup) => ({ ...pickup })),
        props: level.props.map((prop) => ({ ...prop })),
        secrets: level.secrets.map((secret) => ({ ...secret })),
        exit: level.exit ? { ...level.exit } : null,
    };
}

const LEVEL_DATA = [
    createLevel({
        id: 'test-lab',
        name: 'Test Lab',
        meta: {
            episode: 0,
            floor: 0,
            theme: 'prototype',
        },
        nextLevelId: 'e1m1-skeleton',
        layout: [
            '########',
            '#>.....#',
            '#....|.#',
            '#......#',
            '#..+.D.#',
            '#......#',
            '#....E.#',
            '########',
        ],
        entities: [
            {
                id: 'lab-guard-a',
                type: 'guard',
                x: 5.5,
                y: 5.5,
                patrolPoints: [
                    { x: 5.5, y: 5.5 },
                    { x: 2.5, y: 5.5 },
                    { x: 2.5, y: 3.5 },
                    { x: 5.5, y: 3.5 },
                ],
            },
            {
                id: 'lab-guard-b',
                type: 'guard',
                x: 6.2,
                y: 1.8,
                patrolPoints: [
                    { x: 6.2, y: 1.8 },
                    { x: 4.2, y: 1.8 },
                ],
            },
        ],
        pickups: [
            { id: 'lab-ammo', type: 'ammo', x: 3.5, y: 1.5, amount: 8 },
        ],
        props: [
            { id: 'lab-barrel', type: 'barrel', x: 2.5, y: 6.5 },
            { id: 'lab-lamp', type: 'lamp', x: 5.5, y: 3.5 },
        ],
        exit: {
            facing: 'south',
        },
    }),
    createLevel({
        id: 'e1m1-skeleton',
        name: 'Episode 1: Service Entry',
        meta: {
            episode: 1,
            floor: 1,
            theme: 'bunker',
        },
        nextLevelId: 'e1m2-reactor',
        metadata: {
            briefing: 'Breach the service corridors, secure the shotgun and reach the reactor lift.',
            primaryObjective: 'Secure the service lift and recover enough gear for the reactor wing.',
            bonusObjective: 'Sweep the side pockets for hidden maintenance caches.',
        },
        layout: [
            '##################',
            '#>....D....#.....#',
            '#.####.###.#.###.#',
            '#.#..#...#.#...#.#',
            '#.#..###.#.###.#.#',
            '#....#...#...#...#',
            '###D##.#####.###.#',
            '#....#.....#...#.#',
            '#.##.#####.#.#.#.#',
            '#.#..#...#.#.#.#.#',
            '#.#.##.#.#.#.#.###',
            '#...#..#...#.#...#',
            '#.###.#####.#.##G#',
            '#.....#.....#....#',
            '#.#####.########E#',
            '#................#',
            '##################',
        ],
        entities: [
            {
                id: 'foyer-guard',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 5.5, y: 1.5 },
                ],
            },
            {
                id: 'foyer-officer',
                type: 'officer',
                x: 12.5,
                y: 3.5,
                patrolPoints: [
                    { x: 12.5, y: 3.5 },
                    { x: 11.5, y: 5.5 },
                    { x: 14.5, y: 5.5 },
                    { x: 14.5, y: 3.5 },
                ],
            },
            {
                id: 'hall-guard',
                type: 'guard',
                x: 6.5,
                y: 7.5,
                patrolPoints: [
                    { x: 6.5, y: 7.5 },
                    { x: 9.5, y: 7.5 },
                    { x: 8.5, y: 5.5 },
                    { x: 6.5, y: 5.5 },
                ],
            },
            {
                id: 'lock-wing-officer',
                type: 'officer',
                x: 14.5,
                y: 11.5,
                patrolPoints: [
                    { x: 14.5, y: 11.5 },
                    { x: 14.5, y: 13.5 },
                    { x: 11.5, y: 13.5 },
                ],
            },
            {
                id: 'maze-guard',
                type: 'guard',
                x: 13.5,
                y: 13.5,
                patrolPoints: [
                    { x: 13.5, y: 13.5 },
                    { x: 15.5, y: 13.5 },
                    { x: 15.5, y: 15.5 },
                    { x: 10.5, y: 15.5 },
                ],
            },
        ],
        pickups: [
            { id: 'ammo-start', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'shotgun-cache', type: 'shotgun', x: 8.5, y: 5.5, amount: 1 },
            { id: 'medkit-hall', type: 'medkit', x: 7.5, y: 7.5, amount: 15 },
            { id: 'ammo-courtyard', type: 'ammo', x: 12.5, y: 7.5, amount: 8 },
            { id: 'armor-locker', type: 'armor', x: 14.5, y: 3.5, amount: 25 },
            { id: 'treasure-emblem', type: 'treasure', x: 15.5, y: 13.5, amount: 1, value: 300, label: 'WAR BOND' },
            { id: 'gold-key', type: 'gold-key', x: 14.5, y: 15.5, amount: 1 },
        ],
        props: [
            { id: 'service-lamp', type: 'lamp', x: 4.5, y: 1.5 },
            { id: 'service-barrel', type: 'barrel', x: 11.5, y: 13.5 },
            { id: 'service-plant', type: 'plant', x: 2.5, y: 15.5 },
            { id: 'service-armor', type: 'armor', x: 16.5, y: 15.5 },
        ],
        secrets: [
            {
                id: 'service-cache',
                x: 13.5,
                y: 3.5,
                title: 'SECRET CACHE',
                message: 'Maintenance locker secured.',
                value: 150,
            },
            {
                id: 'rear-stash',
                x: 16.5,
                y: 13.5,
                title: 'SECRET STASH',
                message: 'Rear bunker trophy found.',
                value: 200,
            },
        ],
        exit: {
            facing: 'west',
        },
    }),
    createLevel({
        id: 'e1m2-reactor',
        name: 'Episode 1: Reactor Spine',
        meta: {
            episode: 1,
            floor: 2,
            theme: 'reactor',
        },
        nextLevelId: 'e1m3-command',
        metadata: {
            briefing: 'Push through the reactor galleries, recover the machinegun and unlock the command lift.',
            primaryObjective: 'Stabilize the reactor lane, seize the machinegun and open the command lift.',
            bonusObjective: 'Recover hidden stocks before the command deck.',
        },
        layout: [
            '##################',
            '#>....D....#....E#',
            '#.###.###.##.###.#',
            '#...#...#....#...#',
            '###.#.#.######.#.#',
            '#...#.#....G...#.#',
            '#.###.####.###.#.#',
            '#.#...#..#...#.#.#',
            '#.#.###..###.#.#.#',
            '#.#...#....#.#.#.#',
            '#.###.####.#.#.#.#',
            '#.....S....#...#.#',
            '##################',
        ],
        entities: [
            {
                id: 'reactor-guard-a',
                type: 'guard',
                x: 5.5,
                y: 3.5,
                patrolPoints: [
                    { x: 5.5, y: 3.5 },
                    { x: 7.5, y: 3.5 },
                ],
            },
            {
                id: 'reactor-officer-a',
                type: 'officer',
                x: 12.5,
                y: 3.5,
                patrolPoints: [
                    { x: 12.5, y: 3.5 },
                    { x: 15.5, y: 3.5 },
                ],
            },
            {
                id: 'reactor-guard-b',
                type: 'guard',
                x: 14.5,
                y: 7.5,
                patrolPoints: [
                    { x: 14.5, y: 7.5 },
                    { x: 14.5, y: 10.5 },
                ],
            },
            {
                id: 'reactor-commander',
                type: 'commander',
                x: 7.5,
                y: 9.5,
                patrolPoints: [
                    { x: 7.5, y: 9.5 },
                    { x: 10.5, y: 9.5 },
                ],
            },
            {
                id: 'reactor-dog',
                type: 'dog',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 7.5, y: 11.5 },
                ],
            },
        ],
        pickups: [
            { id: 'reactor-ammo-a', type: 'ammo', x: 5.5, y: 1.5, amount: 8 },
            { id: 'reactor-medkit-a', type: 'medkit', x: 9.5, y: 3.5, amount: 18 },
            { id: 'reactor-armor-a', type: 'armor', x: 15.5, y: 3.5, amount: 35 },
            { id: 'reactor-machinegun', type: 'machinegun', x: 10.5, y: 9.5, amount: 1 },
            { id: 'reactor-treasure-a', type: 'treasure', x: 14.5, y: 10.5, amount: 1, value: 400, label: 'CORE PLANS' },
            { id: 'reactor-gold-key', type: 'gold-key', x: 11.5, y: 7.5, amount: 1 },
            { id: 'reactor-ammo-b', type: 'ammo', x: 14.5, y: 5.5, amount: 10 },
            { id: 'reactor-silver-key', type: 'silver-key', x: 7.5, y: 11.5, amount: 1 },
            { id: 'reactor-medkit-b', type: 'medkit', x: 3.5, y: 11.5, amount: 12 },
            { id: 'reactor-rations', type: 'food', x: 15.5, y: 1.5, amount: 8 },
        ],
        props: [
            { id: 'reactor-column', type: 'column', x: 3.5, y: 3.5 },
            { id: 'reactor-lamp', type: 'lamp', x: 2.5, y: 11.5 },
            { id: 'reactor-pot', type: 'pot', x: 14.5, y: 1.5 },
            { id: 'reactor-barrel', type: 'barrel', x: 14.5, y: 9.5 },
        ],
        secrets: [
            {
                id: 'reactor-observer-cache',
                x: 16.5,
                y: 3.5,
                title: 'SECRET CACHE',
                message: 'Observation stash discovered.',
                value: 175,
            },
            {
                id: 'reactor-evac-locker',
                x: 4.5,
                y: 11.5,
                title: 'EVAC LOCKER',
                message: 'Emergency reserve uncovered.',
                value: 175,
            },
        ],
        exit: {
            facing: 'north',
        },
    }),
    createLevel({
        id: 'e1m3-command',
        name: 'Episode 1: Command Lift',
        meta: {
            episode: 1,
            floor: 3,
            theme: 'command',
        },
        nextLevelId: null,
        metadata: {
            briefing: 'Clear the command ring, bring down the commander-in-chief and seize the final elevator.',
            primaryObjective: 'Eliminate the boss before the final lift will unlock.',
            bonusObjective: 'Find hidden intel and valuables before extraction.',
        },
        layout: [
            '##################',
            '#>....D....#....E#',
            '#.###.###.##.###.#',
            '#...#.....#..G...#',
            '#.#.#####.#.###.##',
            '#.#.....#.#...#..#',
            '#.#####.#.###.##.#',
            '#.....#.#...#....#',
            '###.#.#.###.####.#',
            '#...#.#...#....#.#',
            '#.###.###.####.#.#',
            '#.#.....#....#.#.#',
            '#.#.###.####.#.#.#',
            '#...#S..#....#...#',
            '#.###.###.######.#',
            '#......#.........#',
            '##################',
        ],
        entities: [
            {
                id: 'command-guard-a',
                type: 'guard',
                x: 6.5,
                y: 3.5,
                patrolPoints: [
                    { x: 6.5, y: 3.5 },
                    { x: 9.5, y: 3.5 },
                ],
            },
            {
                id: 'command-officer-a',
                type: 'officer',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 11.5, y: 3.5 },
                ],
            },
            {
                id: 'command-officer-b',
                type: 'officer',
                x: 5.5,
                y: 9.5,
                patrolPoints: [
                    { x: 5.5, y: 9.5 },
                    { x: 3.5, y: 11.5 },
                ],
            },
            {
                id: 'command-guard-b',
                type: 'guard',
                x: 12.5,
                y: 11.5,
                patrolPoints: [
                    { x: 12.5, y: 11.5 },
                    { x: 12.5, y: 15.5 },
                    { x: 15.5, y: 15.5 },
                    { x: 11.5, y: 15.5 },
                ],
            },
            {
                id: 'command-commander',
                type: 'commander',
                x: 9.5,
                y: 15.5,
                patrolPoints: [
                    { x: 9.5, y: 15.5 },
                    { x: 14.5, y: 15.5 },
                ],
            },
            {
                id: 'command-boss',
                type: 'boss',
                x: 13.5,
                y: 15.5,
                patrolPoints: [
                    { x: 13.5, y: 15.5 },
                    { x: 11.5, y: 15.5 },
                    { x: 12.5, y: 11.5 },
                ],
            },
        ],
        pickups: [
            { id: 'command-ammo-a', type: 'ammo', x: 4.5, y: 1.5, amount: 10 },
            { id: 'command-medkit-a', type: 'medkit', x: 11.5, y: 5.5, amount: 15 },
            { id: 'command-armor-a', type: 'armor', x: 12.5, y: 3.5, amount: 40 },
            { id: 'command-treasure-a', type: 'treasure', x: 8.5, y: 9.5, amount: 1, value: 500, label: 'INTEL CASE' },
            { id: 'command-gold-key', type: 'gold-key', x: 15.5, y: 7.5, amount: 1 },
            { id: 'command-ammo-b', type: 'ammo', x: 6.5, y: 11.5, amount: 8 },
            { id: 'command-silver-key', type: 'silver-key', x: 6.5, y: 15.5, amount: 1 },
            { id: 'command-chaingun', type: 'chaingun', x: 4.5, y: 15.5, amount: 1 },
            { id: 'command-medkit-b', type: 'medkit', x: 12.5, y: 15.5, amount: 18 },
            { id: 'command-treasure-b', type: 'treasure', x: 14.5, y: 15.5, amount: 1, value: 600, label: 'COMMAND SEAL' },
            { id: 'command-rations', type: 'food', x: 8.5, y: 15.5, amount: 10 },
        ],
        props: [
            { id: 'command-table', type: 'table', x: 3.5, y: 7.5 },
            { id: 'command-column', type: 'column', x: 9.5, y: 3.5 },
            { id: 'command-skeleton', type: 'skeleton', x: 10.5, y: 15.5 },
            { id: 'command-lamp', type: 'lamp', x: 15.5, y: 15.5 },
        ],
        secrets: [
            {
                id: 'command-ops-stash',
                x: 3.5,
                y: 9.5,
                title: 'HIDDEN OPS CACHE',
                message: 'Black-ops stash secured.',
                value: 200,
            },
            {
                id: 'command-vault',
                x: 16.5,
                y: 15.5,
                title: 'SECRET VAULT',
                message: 'Command vault breached.',
                value: 250,
            },
        ],
        exit: {
            facing: 'north',
            requiresKillTypes: ['boss'],
        },
    }),
];

const LEVELS_BY_ID = new Map(LEVEL_DATA.map((level) => [level.id, level]));

export const LEVELS = LEVEL_DATA;

export function getLevel(idOrIndex = 0) {
    if (typeof idOrIndex === 'number') {
        return LEVELS[idOrIndex] ?? LEVELS[0];
    }

    return LEVELS_BY_ID.get(idOrIndex) ?? LEVELS[0];
}

export function loadLevel(idOrIndex = 0) {
    return cloneLevel(getLevel(idOrIndex));
}

export function getNextLevelId(idOrIndex = 0) {
    return getLevel(idOrIndex)?.nextLevelId ?? null;
}
