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
    '~': 9,
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
        name: 'Episode 1: Command Relay',
        meta: {
            episode: 1,
            floor: 3,
            theme: 'command',
        },
        nextLevelId: 'e1m4-storage',
        metadata: {
            briefing: 'Sweep the command relay, recover the security keys and seize the freight lift to storage.',
            primaryObjective: 'Break the command ring and unlock the route to the storage decks.',
            bonusObjective: 'Strip the command offices of intel and valuables before deployment.',
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
        ],
        pickups: [
            { id: 'command-ammo-a', type: 'ammo', x: 4.5, y: 1.5, amount: 10 },
            { id: 'command-medkit-a', type: 'medkit', x: 11.5, y: 5.5, amount: 15 },
            { id: 'command-armor-a', type: 'armor', x: 12.5, y: 3.5, amount: 40 },
            { id: 'command-treasure-a', type: 'treasure', x: 8.5, y: 9.5, amount: 1, value: 500, label: 'INTEL CASE' },
            { id: 'command-gold-key', type: 'gold-key', x: 15.5, y: 7.5, amount: 1 },
            { id: 'command-ammo-b', type: 'ammo', x: 6.5, y: 11.5, amount: 8 },
            { id: 'command-silver-key', type: 'silver-key', x: 6.5, y: 15.5, amount: 1 },
            { id: 'command-ammo-c', type: 'ammo', x: 4.5, y: 15.5, amount: 12 },
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
        },
    }),
    createLevel({
        id: 'e1m4-storage',
        name: 'Episode 1: Storage Bay',
        meta: {
            episode: 1,
            floor: 4,
            theme: 'storage',
        },
        nextLevelId: 'e1m5-prison',
        metadata: {
            briefing: 'Push into the freight stores, cut through the crate aisles and secure the silver route forward.',
            primaryObjective: 'Recover the silver key from the storage maze and unlock the loading lift.',
            bonusObjective: 'Search the side aisles for contraband and hidden supply lockers.',
        },
        layout: [
            '##################',
            '#>....D....#..S.E#',
            '#.++++.###.#.#####',
            '#.#..#...#.#..#..#',
            '#.#..###.#.##.#.##',
            '#...+#...#....#..#',
            '###D##.#####.##..#',
            '#....#.....#..##.#',
            '#.##.#####.#..#..#',
            '#.#..#...#.#.##..#',
            '#.#.##.#.#.#...#.#',
            '#...#..#...#.#...#',
            '#.###.#####.#.##.#',
            '##################',
        ],
        entities: [
            {
                id: 'storage-guard-a',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 10.5, y: 1.5 },
                ],
            },
            {
                id: 'storage-dog-a',
                type: 'dog',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 16.5, y: 3.5 },
                ],
            },
            {
                id: 'storage-guard-b',
                type: 'guard',
                x: 4.5,
                y: 7.5,
                patrolPoints: [
                    { x: 4.5, y: 7.5 },
                    { x: 4.5, y: 9.5 },
                ],
            },
            {
                id: 'storage-officer-a',
                type: 'officer',
                x: 13.5,
                y: 5.5,
                patrolPoints: [
                    { x: 13.5, y: 5.5 },
                    { x: 15.5, y: 5.5 },
                    { x: 13.5, y: 7.5 },
                ],
            },
            {
                id: 'storage-dog-b',
                type: 'dog',
                x: 13.5,
                y: 10.5,
                patrolPoints: [
                    { x: 13.5, y: 10.5 },
                    { x: 14.5, y: 10.5 },
                ],
            },
            {
                id: 'storage-guard-c',
                type: 'guard',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
        ],
        pickups: [
            { id: 'storage-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 8 },
            { id: 'storage-medkit-a', type: 'medkit', x: 7.5, y: 5.5, amount: 16 },
            { id: 'storage-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 25 },
            { id: 'storage-silver-key', type: 'silver-key', x: 15.5, y: 11.5, amount: 1 },
            { id: 'storage-treasure-a', type: 'treasure', x: 13.5, y: 7.5, amount: 1, value: 325, label: 'SMUGGLED BONDS' },
            { id: 'storage-ammo-b', type: 'ammo', x: 4.5, y: 9.5, amount: 10 },
            { id: 'storage-rations', type: 'food', x: 16.5, y: 5.5, amount: 8 },
        ],
        props: [
            { id: 'storage-barrel', type: 'barrel', x: 2.5, y: 5.5 },
            { id: 'storage-table', type: 'table', x: 8.5, y: 7.5 },
            { id: 'storage-plant', type: 'plant', x: 12.5, y: 3.5 },
            { id: 'storage-lamp', type: 'lamp', x: 16.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'storage-contraband',
                x: 12.5,
                y: 5.5,
                title: 'CONTRABAND CACHE',
                message: 'Black-market crates cracked open.',
                value: 200,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e1m5-prison',
        name: 'Episode 1: Prison Block',
        meta: {
            episode: 1,
            floor: 5,
            theme: 'prison',
        },
        nextLevelId: 'e1m6-armory',
        metadata: {
            briefing: 'Sweep the prison tier, cut through the barred cells and seize the gold route to the armory.',
            primaryObjective: 'Recover the gold key from the cell block and open the detention lift.',
            bonusObjective: 'Search the holding cells for blood-stained valuables and hidden stashes.',
        },
        layout: [
            '##################',
            '#>....D....#..G.E#',
            '#.||||.###.#.#####',
            '#.|..|...#.#..#..#',
            '#.|..###.#.##.#.##',
            '#.|..|...#....#..#',
            '###D##.#####.##..#',
            '#.|..#.....#..##.#',
            '#.##.#####.#..#..#',
            '#.|..#...#.#.##..#',
            '#.||##.|.#.#...#.#',
            '#...#..#...#.#...#',
            '#.###.#####.#.##.#',
            '##################',
        ],
        entities: [
            {
                id: 'prison-guard-a',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 10.5, y: 1.5 },
                ],
            },
            {
                id: 'prison-dog-a',
                type: 'dog',
                x: 3.5,
                y: 5.5,
                patrolPoints: [
                    { x: 3.5, y: 5.5 },
                    { x: 3.5, y: 7.5 },
                ],
            },
            {
                id: 'prison-dog-b',
                type: 'dog',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 16.5, y: 3.5 },
                ],
            },
            {
                id: 'prison-officer-a',
                type: 'officer',
                x: 12.5,
                y: 7.5,
                patrolPoints: [
                    { x: 12.5, y: 7.5 },
                    { x: 16.5, y: 7.5 },
                ],
            },
            {
                id: 'prison-guard-b',
                type: 'guard',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
            {
                id: 'prison-officer-b',
                type: 'officer',
                x: 14.5,
                y: 11.5,
                patrolPoints: [
                    { x: 14.5, y: 11.5 },
                    { x: 15.5, y: 11.5 },
                    { x: 16.5, y: 11.5 },
                ],
            },
        ],
        pickups: [
            { id: 'prison-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 8 },
            { id: 'prison-medkit-a', type: 'medkit', x: 7.5, y: 5.5, amount: 16 },
            { id: 'prison-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 20 },
            { id: 'prison-gold-key', type: 'gold-key', x: 15.5, y: 11.5, amount: 1 },
            { id: 'prison-treasure-a', type: 'treasure', x: 16.5, y: 7.5, amount: 1, value: 375, label: 'CELL BLOCK PLANS' },
            { id: 'prison-ammo-b', type: 'ammo', x: 4.5, y: 9.5, amount: 10 },
            { id: 'prison-rations', type: 'food', x: 16.5, y: 5.5, amount: 8 },
            { id: 'prison-medkit-b', type: 'medkit', x: 3.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'prison-skeleton', type: 'skeleton', x: 2.5, y: 11.5 },
            { id: 'prison-table', type: 'table', x: 8.5, y: 7.5 },
            { id: 'prison-blood', type: 'blood', x: 12.5, y: 9.5 },
            { id: 'prison-lamp', type: 'lamp', x: 16.5, y: 3.5 },
        ],
        secrets: [
            {
                id: 'prison-locker',
                x: 12.5,
                y: 5.5,
                title: 'LOCKER RAID',
                message: 'A hidden jailer cache has been breached.',
                value: 225,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e1m6-armory',
        name: 'Episode 1: Armory Breach',
        meta: {
            episode: 1,
            floor: 6,
            theme: 'armory',
        },
        nextLevelId: 'e1m7-laboratory',
        metadata: {
            briefing: 'Storm the armory floor, survive the heavy resistance and claim the chaingun cache.',
            primaryObjective: 'Secure the gold key, seize the chaingun and unlock the laboratory route.',
            bonusObjective: 'Ransack the weapon vaults and strip every reserve you can carry.',
        },
        layout: [
            '##################',
            '#>.....D........##',
            '#.====.######.##.#',
            '#.#............#.#',
            '#.#.====.####.#.##',
            '#.#......#....#.##',
            '#.######.#.####.##',
            '#......#.#....G.E#',
            '###.##.#.####.####',
            '#...##.#....#.#..#',
            '#.#....####.#.#..#',
            '#.#.##......#....#',
            '#...##############',
            '##################',
        ],
        entities: [
            {
                id: 'armory-officer-a',
                type: 'officer',
                x: 10.5,
                y: 1.5,
                patrolPoints: [
                    { x: 10.5, y: 1.5 },
                    { x: 14.5, y: 1.5 },
                ],
            },
            {
                id: 'armory-officer-b',
                type: 'officer',
                x: 13.5,
                y: 3.5,
                patrolPoints: [
                    { x: 13.5, y: 3.5 },
                    { x: 15.5, y: 3.5 },
                    { x: 13.5, y: 5.5 },
                ],
            },
            {
                id: 'armory-guard-a',
                type: 'guard',
                x: 4.5,
                y: 3.5,
                patrolPoints: [
                    { x: 4.5, y: 3.5 },
                    { x: 8.5, y: 3.5 },
                ],
            },
            {
                id: 'armory-guard-b',
                type: 'guard',
                x: 12.5,
                y: 7.5,
                patrolPoints: [
                    { x: 12.5, y: 7.5 },
                    { x: 13.5, y: 7.5 },
                ],
            },
            {
                id: 'armory-commander',
                type: 'commander',
                x: 14.5,
                y: 11.5,
                patrolPoints: [
                    { x: 14.5, y: 11.5 },
                    { x: 15.5, y: 11.5 },
                    { x: 16.5, y: 11.5 },
                ],
            },
            {
                id: 'armory-officer-c',
                type: 'officer',
                x: 8.5,
                y: 11.5,
                patrolPoints: [
                    { x: 8.5, y: 11.5 },
                    { x: 11.5, y: 11.5 },
                ],
            },
            {
                id: 'armory-guard-c',
                type: 'guard',
                x: 2.5,
                y: 9.5,
                patrolPoints: [
                    { x: 2.5, y: 9.5 },
                    { x: 3.5, y: 9.5 },
                ],
            },
        ],
        pickups: [
            { id: 'armory-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'armory-medkit-a', type: 'medkit', x: 7.5, y: 3.5, amount: 15 },
            { id: 'armory-armor-a', type: 'armor', x: 13.5, y: 5.5, amount: 30 },
            { id: 'armory-chaingun', type: 'chaingun', x: 15.5, y: 11.5, amount: 1 },
            { id: 'armory-gold-key', type: 'gold-key', x: 3.5, y: 12.5, amount: 1 },
            { id: 'armory-treasure-a', type: 'treasure', x: 11.5, y: 9.5, amount: 1, value: 450, label: 'MUNITIONS BOND' },
            { id: 'armory-ammo-b', type: 'ammo', x: 16.5, y: 9.5, amount: 12 },
            { id: 'armory-medkit-b', type: 'medkit', x: 5.5, y: 5.5, amount: 12 },
        ],
        props: [
            { id: 'armory-barrel', type: 'barrel', x: 4.5, y: 5.5 },
            { id: 'armory-column', type: 'column', x: 10.5, y: 9.5 },
            { id: 'armory-table', type: 'table', x: 12.5, y: 3.5 },
            { id: 'armory-lamp', type: 'lamp', x: 16.5, y: 3.5 },
            { id: 'armory-pot', type: 'pot', x: 1.5, y: 2.5 },
        ],
        secrets: [
            {
                id: 'armory-vault',
                x: 13.5,
                y: 9.5,
                title: 'ARMORY VAULT',
                message: 'A sealed weapons reserve has been opened.',
                value: 250,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e1m7-laboratory',
        name: 'Episode 1: Research Lab',
        meta: {
            episode: 1,
            floor: 7,
            theme: 'laboratory',
        },
        nextLevelId: 'e1m8-bunker',
        metadata: {
            briefing: 'Break into the research labs, survive the arena-like test halls and secure the bunker route.',
            primaryObjective: 'Recover the gold key, clear the lab floor and unlock the bunker transfer elevator.',
            bonusObjective: 'Strip the research floor of samples, plans and hidden reserves.',
        },
        layout: [
            '##################',
            '#>...D...........#',
            '#..%~%....~%###..#',
            '#......##........#',
            '###.##....~##.#..#',
            '#...#..%~....#...#',
            '#.#.#.####.###.#.#',
            '#.#...#..#.....#.#',
            '#.###.#..#####.#.#',
            '#.....#..~.....#.#',
            '#.###.####.###.###',
            '#...#......#..G.E#',
            '#.....####.#.#####',
            '##################',
        ],
        entities: [
            {
                id: 'lab-guard-a',
                type: 'guard',
                x: 7.5,
                y: 1.5,
                patrolPoints: [
                    { x: 7.5, y: 1.5 },
                    { x: 12.5, y: 1.5 },
                ],
            },
            {
                id: 'lab-dog-a',
                type: 'dog',
                x: 3.5,
                y: 3.5,
                patrolPoints: [
                    { x: 3.5, y: 3.5 },
                    { x: 6.5, y: 3.5 },
                ],
            },
            {
                id: 'lab-dog-b',
                type: 'dog',
                x: 12.5,
                y: 3.5,
                patrolPoints: [
                    { x: 12.5, y: 3.5 },
                    { x: 15.5, y: 3.5 },
                ],
            },
            {
                id: 'lab-dog-c',
                type: 'dog',
                x: 14.5,
                y: 9.5,
                patrolPoints: [
                    { x: 14.5, y: 9.5 },
                    { x: 12.5, y: 9.5 },
                ],
            },
            {
                id: 'lab-officer-a',
                type: 'officer',
                x: 15.5,
                y: 5.5,
                patrolPoints: [
                    { x: 15.5, y: 5.5 },
                    { x: 16.5, y: 5.5 },
                    { x: 15.5, y: 3.5 },
                ],
            },
            {
                id: 'lab-officer-b',
                type: 'officer',
                x: 8.5,
                y: 11.5,
                patrolPoints: [
                    { x: 8.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
            {
                id: 'lab-commander',
                type: 'commander',
                x: 10.5,
                y: 7.5,
                patrolPoints: [
                    { x: 10.5, y: 7.5 },
                    { x: 14.5, y: 7.5 },
                ],
            },
            {
                id: 'lab-guard-b',
                type: 'guard',
                x: 2.5,
                y: 9.5,
                patrolPoints: [
                    { x: 2.5, y: 9.5 },
                    { x: 5.5, y: 9.5 },
                ],
            },
        ],
        pickups: [
            { id: 'lab-ammo-a', type: 'ammo', x: 2.5, y: 2.5, amount: 10 },
            { id: 'lab-medkit-a', type: 'medkit', x: 10.5, y: 3.5, amount: 16 },
            { id: 'lab-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 30 },
            { id: 'lab-gold-key', type: 'gold-key', x: 3.5, y: 12.5, amount: 1 },
            { id: 'lab-treasure-a', type: 'treasure', x: 11.5, y: 5.5, amount: 1, value: 525, label: 'PROTOTYPE NOTES' },
            { id: 'lab-rations', type: 'food', x: 15.5, y: 3.5, amount: 8 },
            { id: 'lab-ammo-b', type: 'ammo', x: 14.5, y: 7.5, amount: 10 },
            { id: 'lab-medkit-b', type: 'medkit', x: 2.5, y: 11.5, amount: 12 },
            { id: 'lab-armor-b', type: 'armor', x: 13.5, y: 9.5, amount: 18 },
        ],
        props: [
            { id: 'lab-column', type: 'column', x: 3.5, y: 7.5 },
            { id: 'lab-pot', type: 'pot', x: 8.5, y: 9.5 },
            { id: 'lab-plant', type: 'plant', x: 16.5, y: 5.5 },
            { id: 'lab-lamp', type: 'lamp', x: 1.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'lab-observation',
                x: 15.5,
                y: 1.5,
                title: 'OBSERVATION CACHE',
                message: 'A hidden observation alcove has been breached.',
                value: 225,
            },
            {
                id: 'lab-sample-locker',
                x: 10.5,
                y: 9.5,
                title: 'SAMPLE LOCKER',
                message: 'Experimental samples recovered.',
                value: 250,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e1m8-bunker',
        name: 'Episode 1: Deep Bunker',
        meta: {
            episode: 1,
            floor: 8,
            theme: 'bunker',
        },
        nextLevelId: 'e1m9-tower',
        metadata: {
            briefing: 'Descend into the deep bunker, recover both keys and crack the fortress route to the tower.',
            primaryObjective: 'Secure the silver and gold keys, then unlock the final transfer elevator.',
            bonusObjective: 'Search the fortress pockets for hidden reserves before the tower assault.',
        },
        layout: [
            '##################',
            '#>....D....#..G.E#',
            '#.~&&~.###.#.#####',
            '#.#..#...#.#..#..#',
            '#.#..###.#.##.#.##',
            '#...~#...#....#..#',
            '###S##.#####.##..#',
            '#....#.....#..##.#',
            '#.##.#####.#..#..#',
            '#.#..#...#.#.##..#',
            '#.#.##.#.#.#...#.#',
            '#...#..#...#.#...#',
            '#.###.#####.#.##.#',
            '##################',
        ],
        entities: [
            {
                id: 'bunker-guard-a',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 10.5, y: 1.5 },
                ],
            },
            {
                id: 'bunker-officer-a',
                type: 'officer',
                x: 13.5,
                y: 5.5,
                patrolPoints: [
                    { x: 13.5, y: 5.5 },
                    { x: 15.5, y: 5.5 },
                    { x: 13.5, y: 7.5 },
                ],
            },
            {
                id: 'bunker-commander-a',
                type: 'commander',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
            {
                id: 'bunker-officer-b',
                type: 'officer',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 16.5, y: 3.5 },
                ],
            },
            {
                id: 'bunker-guard-b',
                type: 'guard',
                x: 4.5,
                y: 7.5,
                patrolPoints: [
                    { x: 4.5, y: 7.5 },
                    { x: 4.5, y: 9.5 },
                ],
            },
            {
                id: 'bunker-guard-c',
                type: 'guard',
                x: 13.5,
                y: 10.5,
                patrolPoints: [
                    { x: 13.5, y: 10.5 },
                    { x: 14.5, y: 10.5 },
                ],
            },
            {
                id: 'bunker-commander-b',
                type: 'commander',
                x: 2.5,
                y: 11.5,
                patrolPoints: [
                    { x: 2.5, y: 11.5 },
                    { x: 3.5, y: 11.5 },
                ],
            },
        ],
        pickups: [
            { id: 'bunker-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'bunker-medkit-a', type: 'medkit', x: 7.5, y: 5.5, amount: 16 },
            { id: 'bunker-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 35 },
            { id: 'bunker-silver-key', type: 'silver-key', x: 3.5, y: 5.5, amount: 1 },
            { id: 'bunker-gold-key', type: 'gold-key', x: 3.5, y: 11.5, amount: 1 },
            { id: 'bunker-treasure-a', type: 'treasure', x: 13.5, y: 7.5, amount: 1, value: 575, label: 'FORTRESS LEDGER' },
            { id: 'bunker-rations', type: 'food', x: 16.5, y: 5.5, amount: 8 },
            { id: 'bunker-ammo-b', type: 'ammo', x: 15.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'bunker-barrel', type: 'barrel', x: 2.5, y: 7.5 },
            { id: 'bunker-table', type: 'table', x: 8.5, y: 7.5 },
            { id: 'bunker-column', type: 'column', x: 12.5, y: 9.5 },
            { id: 'bunker-lamp', type: 'lamp', x: 16.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'bunker-relic',
                x: 12.5,
                y: 5.5,
                title: 'FORTRESS RELIC',
                message: 'A sealed bunker alcove has been opened.',
                value: 275,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e1m9-tower',
        name: 'Episode 1: Command Tower',
        meta: {
            episode: 1,
            floor: 9,
            theme: 'tower',
        },
        nextLevelId: null,
        metadata: {
            briefing: 'Ascend the command tower, recover the final key and bring down the fortress commander for good.',
            primaryObjective: 'Kill the boss, unlock the tower elevator and finish the episode.',
            bonusObjective: 'Strip the tower offices and vaults before extraction.',
        },
        layout: [
            '##################',
            '#>.....D........##',
            '#.!!!!.######.##.#',
            '#.#............#.#',
            '#.#.!!!!.####.#.##',
            '#.#......#....#.##',
            '#.######.#.####.##',
            '#......#.#....G.E#',
            '###.##.#.####.####',
            '#...##.#....#.#..#',
            '#.#....####.#.#..#',
            '#.#.##......#....#',
            '#...##########...#',
            '##################',
        ],
        entities: [
            {
                id: 'tower-officer-a',
                type: 'officer',
                x: 10.5,
                y: 1.5,
                patrolPoints: [
                    { x: 10.5, y: 1.5 },
                    { x: 14.5, y: 1.5 },
                ],
            },
            {
                id: 'tower-officer-b',
                type: 'officer',
                x: 7.5,
                y: 3.5,
                patrolPoints: [
                    { x: 7.5, y: 3.5 },
                    { x: 12.5, y: 3.5 },
                ],
            },
            {
                id: 'tower-officer-c',
                type: 'officer',
                x: 13.5,
                y: 3.5,
                patrolPoints: [
                    { x: 13.5, y: 3.5 },
                    { x: 14.5, y: 5.5 },
                    { x: 12.5, y: 5.5 },
                ],
            },
            {
                id: 'tower-guard-a',
                type: 'guard',
                x: 2.5,
                y: 7.5,
                patrolPoints: [
                    { x: 2.5, y: 7.5 },
                    { x: 5.5, y: 7.5 },
                ],
            },
            {
                id: 'tower-commander',
                type: 'commander',
                x: 14.5,
                y: 11.5,
                patrolPoints: [
                    { x: 14.5, y: 11.5 },
                    { x: 15.5, y: 11.5 },
                    { x: 16.5, y: 11.5 },
                ],
            },
            {
                id: 'tower-boss',
                type: 'boss',
                x: 15.5,
                y: 11.5,
                patrolPoints: [
                    { x: 15.5, y: 11.5 },
                    { x: 14.5, y: 11.5 },
                    { x: 16.5, y: 12.5 },
                ],
            },
        ],
        pickups: [
            { id: 'tower-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'tower-medkit-a', type: 'medkit', x: 7.5, y: 3.5, amount: 16 },
            { id: 'tower-armor-a', type: 'armor', x: 13.5, y: 5.5, amount: 35 },
            { id: 'tower-gold-key', type: 'gold-key', x: 16.5, y: 11.5, amount: 1 },
            { id: 'tower-treasure-a', type: 'treasure', x: 10.5, y: 7.5, amount: 1, value: 650, label: 'TOWER SEAL' },
            { id: 'tower-rations', type: 'food', x: 16.5, y: 9.5, amount: 8 },
            { id: 'tower-ammo-b', type: 'ammo', x: 2.5, y: 12.5, amount: 12 },
        ],
        props: [
            { id: 'tower-column', type: 'column', x: 3.5, y: 3.5 },
            { id: 'tower-table', type: 'table', x: 11.5, y: 3.5 },
            { id: 'tower-skeleton', type: 'skeleton', x: 3.5, y: 11.5 },
            { id: 'tower-lamp', type: 'lamp', x: 3.5, y: 9.5 },
        ],
        secrets: [
            {
                id: 'tower-vault',
                x: 12.5,
                y: 5.5,
                title: 'TOWER VAULT',
                message: 'The command vault has been cracked open.',
                value: 300,
            },
            {
                id: 'tower-observatory',
                x: 15.5,
                y: 12.5,
                title: 'OBSERVATORY CACHE',
                message: 'A hidden observatory locker has been breached.',
                value: 300,
            },
        ],
        exit: {
            facing: 'east',
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
