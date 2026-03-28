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
        nextLevelId: 'e2m1-foundry',
        metadata: {
            briefing: 'Ascend the command tower, break the episode boss and seize the transport route into the deeper complex.',
            primaryObjective: 'Kill the boss, unlock the tower elevator and force the push into Episode 2.',
            bonusObjective: 'Strip the tower offices and vaults before the underground transfer.',
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
    createLevel({
        id: 'e2m1-foundry',
        name: 'Episode 2: Foundry Gate',
        meta: {
            episode: 2,
            floor: 1,
            theme: 'foundry',
        },
        nextLevelId: 'e2m2-cistern',
        metadata: {
            briefing: 'Break into the furnace district, clear the guard ring and seize the gold route into the cisterns.',
            primaryObjective: 'Recover the gold key from the foundry lanes and unlock the cistern transfer lift.',
            bonusObjective: 'Plunder the loading pockets for contraband, ammo and forged scrip.',
        },
        layout: [
            '##################',
            '#>....D....#..G.E#',
            '#.==+~.###.#.#####',
            '#.#..#...#.#..#..#',
            '#.#..###.#.##.#.##',
            '#...=#...#....#..#',
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
                id: 'foundry-guard-a',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 10.5, y: 1.5 },
                ],
            },
            {
                id: 'foundry-dog-a',
                type: 'dog',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 16.5, y: 3.5 },
                ],
            },
            {
                id: 'foundry-guard-b',
                type: 'guard',
                x: 4.5,
                y: 7.5,
                patrolPoints: [
                    { x: 4.5, y: 7.5 },
                    { x: 4.5, y: 9.5 },
                ],
            },
            {
                id: 'foundry-officer-a',
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
                id: 'foundry-dog-b',
                type: 'dog',
                x: 13.5,
                y: 10.5,
                patrolPoints: [
                    { x: 13.5, y: 10.5 },
                    { x: 14.5, y: 10.5 },
                ],
            },
            {
                id: 'foundry-officer-b',
                type: 'officer',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
        ],
        pickups: [
            { id: 'foundry-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'foundry-medkit-a', type: 'medkit', x: 7.5, y: 5.5, amount: 16 },
            { id: 'foundry-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 24 },
            { id: 'foundry-gold-key', type: 'gold-key', x: 15.5, y: 11.5, amount: 1 },
            { id: 'foundry-treasure-a', type: 'treasure', x: 13.5, y: 7.5, amount: 1, value: 375, label: 'FORGED SCRIP' },
            { id: 'foundry-ammo-b', type: 'ammo', x: 4.5, y: 9.5, amount: 12 },
            { id: 'foundry-rations', type: 'food', x: 16.5, y: 5.5, amount: 8 },
            { id: 'foundry-medkit-b', type: 'medkit', x: 3.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'foundry-barrel', type: 'barrel', x: 2.5, y: 5.5 },
            { id: 'foundry-table', type: 'table', x: 8.5, y: 7.5 },
            { id: 'foundry-lamp', type: 'lamp', x: 12.5, y: 3.5 },
            { id: 'foundry-column', type: 'column', x: 16.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'foundry-cache',
                x: 12.5,
                y: 5.5,
                title: 'FOUNDRY CACHE',
                message: 'A hidden smelter locker has been opened.',
                value: 225,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m2-cistern',
        name: 'Episode 2: Flooded Cistern',
        meta: {
            episode: 2,
            floor: 2,
            theme: 'cistern',
        },
        nextLevelId: 'e2m3-barracks',
        metadata: {
            briefing: 'Sweep the cistern channels, survive the wet stone chambers and open the silver route to the barracks.',
            primaryObjective: 'Recover the silver key from the cistern floor and unlock the barracks access lift.',
            bonusObjective: 'Search the side sumps for hidden reserves and engineering records.',
        },
        layout: [
            '##################',
            '#>...D...........#',
            '#..%~%....%%###..#',
            '#......##........#',
            '###.##....%##.#..#',
            '#...#..~~....#...#',
            '#.#.#.####.###.#.#',
            '#.#...#..#.....#.#',
            '#.###.#..#####.#.#',
            '#.....#..%.....#.#',
            '#.###.####.###.###',
            '#...#......#..S.E#',
            '#.....####.#.#####',
            '##################',
        ],
        entities: [
            {
                id: 'cistern-guard-a',
                type: 'guard',
                x: 7.5,
                y: 1.5,
                patrolPoints: [
                    { x: 7.5, y: 1.5 },
                    { x: 12.5, y: 1.5 },
                ],
            },
            {
                id: 'cistern-dog-a',
                type: 'dog',
                x: 3.5,
                y: 3.5,
                patrolPoints: [
                    { x: 3.5, y: 3.5 },
                    { x: 6.5, y: 3.5 },
                ],
            },
            {
                id: 'cistern-officer-a',
                type: 'officer',
                x: 12.5,
                y: 3.5,
                patrolPoints: [
                    { x: 12.5, y: 3.5 },
                    { x: 15.5, y: 3.5 },
                ],
            },
            {
                id: 'cistern-dog-b',
                type: 'dog',
                x: 14.5,
                y: 9.5,
                patrolPoints: [
                    { x: 14.5, y: 9.5 },
                    { x: 12.5, y: 9.5 },
                ],
            },
            {
                id: 'cistern-officer-b',
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
                id: 'cistern-commander-a',
                type: 'commander',
                x: 10.5,
                y: 7.5,
                patrolPoints: [
                    { x: 10.5, y: 7.5 },
                    { x: 14.5, y: 7.5 },
                ],
            },
            {
                id: 'cistern-guard-b',
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
            { id: 'cistern-ammo-a', type: 'ammo', x: 2.5, y: 2.5, amount: 10 },
            { id: 'cistern-medkit-a', type: 'medkit', x: 10.5, y: 3.5, amount: 16 },
            { id: 'cistern-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 24 },
            { id: 'cistern-silver-key', type: 'silver-key', x: 3.5, y: 12.5, amount: 1 },
            { id: 'cistern-treasure-a', type: 'treasure', x: 11.5, y: 5.5, amount: 1, value: 450, label: 'CISTERN LEDGER' },
            { id: 'cistern-rations', type: 'food', x: 15.5, y: 3.5, amount: 8 },
            { id: 'cistern-ammo-b', type: 'ammo', x: 14.5, y: 7.5, amount: 10 },
            { id: 'cistern-medkit-b', type: 'medkit', x: 2.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'cistern-column', type: 'column', x: 3.5, y: 7.5 },
            { id: 'cistern-pot', type: 'pot', x: 8.5, y: 9.5 },
            { id: 'cistern-lamp', type: 'lamp', x: 16.5, y: 5.5 },
            { id: 'cistern-plant', type: 'plant', x: 1.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'cistern-observation',
                x: 15.5,
                y: 1.5,
                title: 'INTAKE LOCKER',
                message: 'A maintenance locker above the cistern has been breached.',
                value: 250,
            },
            {
                id: 'cistern-sluice',
                x: 10.5,
                y: 9.5,
                title: 'SLUICE CACHE',
                message: 'A hidden sluice recess has been uncovered.',
                value: 250,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m3-barracks',
        name: 'Episode 2: Barracks Ring',
        meta: {
            episode: 2,
            floor: 3,
            theme: 'barracks',
        },
        nextLevelId: 'e2m4-catacomb',
        metadata: {
            briefing: 'Crack the barracks ring, sweep the cell lanes and seize the gold route into the catacombs.',
            primaryObjective: 'Recover the gold key from the barracks core and unlock the catacomb descent.',
            bonusObjective: 'Raid the bunks, lockers and holding pens for reserves before moving on.',
        },
        layout: [
            '##################',
            '#>....D....#..G.E#',
            '#.||||.###.#.#####',
            '#.|..|...#.#..#..#',
            '#.|++###.#.##.#.##',
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
                id: 'barracks-guard-a',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 10.5, y: 1.5 },
                ],
            },
            {
                id: 'barracks-dog-a',
                type: 'dog',
                x: 3.5,
                y: 5.5,
                patrolPoints: [
                    { x: 3.5, y: 5.5 },
                    { x: 3.5, y: 7.5 },
                ],
            },
            {
                id: 'barracks-dog-b',
                type: 'dog',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 16.5, y: 3.5 },
                ],
            },
            {
                id: 'barracks-officer-a',
                type: 'officer',
                x: 12.5,
                y: 7.5,
                patrolPoints: [
                    { x: 12.5, y: 7.5 },
                    { x: 16.5, y: 7.5 },
                ],
            },
            {
                id: 'barracks-guard-b',
                type: 'guard',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
            {
                id: 'barracks-commander',
                type: 'commander',
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
            { id: 'barracks-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 8 },
            { id: 'barracks-medkit-a', type: 'medkit', x: 7.5, y: 5.5, amount: 16 },
            { id: 'barracks-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 22 },
            { id: 'barracks-gold-key', type: 'gold-key', x: 15.5, y: 11.5, amount: 1 },
            { id: 'barracks-treasure-a', type: 'treasure', x: 16.5, y: 7.5, amount: 1, value: 420, label: 'QUARTERMASTER STAMP' },
            { id: 'barracks-ammo-b', type: 'ammo', x: 4.5, y: 9.5, amount: 10 },
            { id: 'barracks-rations', type: 'food', x: 16.5, y: 5.5, amount: 8 },
            { id: 'barracks-medkit-b', type: 'medkit', x: 3.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'barracks-skeleton', type: 'skeleton', x: 2.5, y: 11.5 },
            { id: 'barracks-table', type: 'table', x: 8.5, y: 7.5 },
            { id: 'barracks-blood', type: 'blood', x: 12.5, y: 9.5 },
            { id: 'barracks-lamp', type: 'lamp', x: 16.5, y: 3.5 },
        ],
        secrets: [
            {
                id: 'barracks-locker',
                x: 12.5,
                y: 5.5,
                title: 'ARMORY LOCKER',
                message: 'A hidden barracks weapons locker has been opened.',
                value: 225,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m4-catacomb',
        name: 'Episode 2: Catacomb Lock',
        meta: {
            episode: 2,
            floor: 4,
            theme: 'catacomb',
        },
        nextLevelId: 'e2m5-docks',
        metadata: {
            briefing: 'Push into the catacombs, survive the cracked stone halls and open the gold route back to the cargo line.',
            primaryObjective: 'Recover the gold key from the catacomb vaults and unlock the dockside ascent.',
            bonusObjective: 'Raid the burial alcoves and relic lockers for valuables before resurfacing.',
        },
        layout: [
            '##################',
            '#>...D...........#',
            '#..&~&....&&###..#',
            '#......##........#',
            '###.##....~##.#..#',
            '#...#..&&....#...#',
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
                id: 'catacomb-dog-a',
                type: 'dog',
                x: 3.5,
                y: 3.5,
                patrolPoints: [
                    { x: 3.5, y: 3.5 },
                    { x: 6.5, y: 3.5 },
                ],
            },
            {
                id: 'catacomb-dog-b',
                type: 'dog',
                x: 14.5,
                y: 9.5,
                patrolPoints: [
                    { x: 14.5, y: 9.5 },
                    { x: 12.5, y: 9.5 },
                ],
            },
            {
                id: 'catacomb-officer-a',
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
                id: 'catacomb-officer-b',
                type: 'officer',
                x: 8.5,
                y: 11.5,
                patrolPoints: [
                    { x: 8.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
            {
                id: 'catacomb-commander-a',
                type: 'commander',
                x: 10.5,
                y: 7.5,
                patrolPoints: [
                    { x: 10.5, y: 7.5 },
                    { x: 14.5, y: 7.5 },
                ],
            },
            {
                id: 'catacomb-guard-a',
                type: 'guard',
                x: 2.5,
                y: 9.5,
                patrolPoints: [
                    { x: 2.5, y: 9.5 },
                    { x: 5.5, y: 9.5 },
                ],
            },
            {
                id: 'catacomb-commander-b',
                type: 'commander',
                x: 13.5,
                y: 3.5,
                patrolPoints: [
                    { x: 13.5, y: 3.5 },
                    { x: 14.5, y: 3.5 },
                ],
            },
        ],
        pickups: [
            { id: 'catacomb-ammo-a', type: 'ammo', x: 2.5, y: 2.5, amount: 10 },
            { id: 'catacomb-medkit-a', type: 'medkit', x: 10.5, y: 3.5, amount: 16 },
            { id: 'catacomb-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 28 },
            { id: 'catacomb-gold-key', type: 'gold-key', x: 3.5, y: 12.5, amount: 1 },
            { id: 'catacomb-treasure-a', type: 'treasure', x: 11.5, y: 5.5, amount: 1, value: 500, label: 'CRYPT RELIC' },
            { id: 'catacomb-rations', type: 'food', x: 15.5, y: 3.5, amount: 8 },
            { id: 'catacomb-ammo-b', type: 'ammo', x: 14.5, y: 7.5, amount: 10 },
            { id: 'catacomb-medkit-b', type: 'medkit', x: 2.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'catacomb-column', type: 'column', x: 3.5, y: 7.5 },
            { id: 'catacomb-pot', type: 'pot', x: 8.5, y: 9.5 },
            { id: 'catacomb-skeleton', type: 'skeleton', x: 16.5, y: 5.5 },
            { id: 'catacomb-lamp', type: 'lamp', x: 1.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'catacomb-ossuary',
                x: 15.5,
                y: 1.5,
                title: 'OSSUARY CACHE',
                message: 'An ossuary alcove has been pried open.',
                value: 250,
            },
            {
                id: 'catacomb-reliquary',
                x: 10.5,
                y: 9.5,
                title: 'RELIQUARY LOCKER',
                message: 'A reliquary stash has been uncovered.',
                value: 275,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m5-docks',
        name: 'Episode 2: Cargo Docks',
        meta: {
            episode: 2,
            floor: 5,
            theme: 'docks',
        },
        nextLevelId: 'e2m6-archives',
        metadata: {
            briefing: 'Storm the cargo docks, clear the dockworkers and seize the silver route into the records wing.',
            primaryObjective: 'Recover the silver key from the dockside lanes and open the archive transfer.',
            bonusObjective: 'Search the freight stacks and dock offices for smuggled valuables.',
        },
        layout: [
            '##################',
            '#>....D....#..S.E#',
            '#.==++.###.#.#####',
            '#.#..#...#.#..#..#',
            '#.|..###.#.##.#.##',
            '#.|.=|...#....#..#',
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
                id: 'docks-guard-a',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 10.5, y: 1.5 },
                ],
            },
            {
                id: 'docks-dog-a',
                type: 'dog',
                x: 3.5,
                y: 5.5,
                patrolPoints: [
                    { x: 3.5, y: 5.5 },
                    { x: 3.5, y: 7.5 },
                ],
            },
            {
                id: 'docks-officer-a',
                type: 'officer',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 16.5, y: 3.5 },
                ],
            },
            {
                id: 'docks-officer-b',
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
                id: 'docks-commander-a',
                type: 'commander',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
            {
                id: 'docks-guard-b',
                type: 'guard',
                x: 4.5,
                y: 7.5,
                patrolPoints: [
                    { x: 4.5, y: 7.5 },
                    { x: 4.5, y: 9.5 },
                ],
            },
        ],
        pickups: [
            { id: 'docks-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'docks-medkit-a', type: 'medkit', x: 7.5, y: 5.5, amount: 16 },
            { id: 'docks-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 28 },
            { id: 'docks-silver-key', type: 'silver-key', x: 15.5, y: 11.5, amount: 1 },
            { id: 'docks-treasure-a', type: 'treasure', x: 13.5, y: 7.5, amount: 1, value: 475, label: 'DOCK MANIFEST' },
            { id: 'docks-ammo-b', type: 'ammo', x: 4.5, y: 9.5, amount: 12 },
            { id: 'docks-rations', type: 'food', x: 16.5, y: 5.5, amount: 8 },
            { id: 'docks-medkit-b', type: 'medkit', x: 3.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'docks-barrel', type: 'barrel', x: 2.5, y: 7.5 },
            { id: 'docks-table', type: 'table', x: 8.5, y: 7.5 },
            { id: 'docks-lamp', type: 'lamp', x: 12.5, y: 3.5 },
            { id: 'docks-column', type: 'column', x: 16.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'docks-contraband',
                x: 12.5,
                y: 5.5,
                title: 'DOCKSIDE CACHE',
                message: 'A hidden dockside locker has been opened.',
                value: 250,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m6-archives',
        name: 'Episode 2: Archive Vault',
        meta: {
            episode: 2,
            floor: 6,
            theme: 'archives',
        },
        nextLevelId: 'e2m7-furnace',
        metadata: {
            briefing: 'Breach the archive vaults, sweep the sealed records halls and unlock the route into the furnace works.',
            primaryObjective: 'Recover the gold key from the archive floor and open the furnace access lift.',
            bonusObjective: 'Strip the archive lockers and trophy cases of everything valuable.',
        },
        layout: [
            '##################',
            '#>...D...........#',
            '#..!!!....%%###..#',
            '#......##........#',
            '###.##....!##.#..#',
            '#...#..%%....#...#',
            '#.#.#.####.###.#.#',
            '#.#...#..#.....#.#',
            '#.###.#..#####.#.#',
            '#.....#..%.....#.#',
            '#.###.####.###.###',
            '#...#......#..G.E#',
            '#.....####.#.#####',
            '##################',
        ],
        entities: [
            {
                id: 'archives-guard-a',
                type: 'guard',
                x: 7.5,
                y: 1.5,
                patrolPoints: [
                    { x: 7.5, y: 1.5 },
                    { x: 12.5, y: 1.5 },
                ],
            },
            {
                id: 'archives-dog-a',
                type: 'dog',
                x: 3.5,
                y: 3.5,
                patrolPoints: [
                    { x: 3.5, y: 3.5 },
                    { x: 6.5, y: 3.5 },
                ],
            },
            {
                id: 'archives-officer-a',
                type: 'officer',
                x: 12.5,
                y: 3.5,
                patrolPoints: [
                    { x: 12.5, y: 3.5 },
                    { x: 15.5, y: 3.5 },
                ],
            },
            {
                id: 'archives-officer-b',
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
                id: 'archives-commander-a',
                type: 'commander',
                x: 10.5,
                y: 7.5,
                patrolPoints: [
                    { x: 10.5, y: 7.5 },
                    { x: 14.5, y: 7.5 },
                ],
            },
            {
                id: 'archives-commander-b',
                type: 'commander',
                x: 13.5,
                y: 9.5,
                patrolPoints: [
                    { x: 13.5, y: 9.5 },
                    { x: 14.5, y: 9.5 },
                ],
            },
            {
                id: 'archives-guard-b',
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
            { id: 'archives-ammo-a', type: 'ammo', x: 2.5, y: 2.5, amount: 10 },
            { id: 'archives-medkit-a', type: 'medkit', x: 10.5, y: 3.5, amount: 16 },
            { id: 'archives-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 30 },
            { id: 'archives-gold-key', type: 'gold-key', x: 3.5, y: 12.5, amount: 1 },
            { id: 'archives-treasure-a', type: 'treasure', x: 11.5, y: 5.5, amount: 1, value: 575, label: 'ARCHIVE SEAL' },
            { id: 'archives-rations', type: 'food', x: 15.5, y: 3.5, amount: 8 },
            { id: 'archives-ammo-b', type: 'ammo', x: 14.5, y: 7.5, amount: 10 },
            { id: 'archives-medkit-b', type: 'medkit', x: 2.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'archives-column', type: 'column', x: 3.5, y: 7.5 },
            { id: 'archives-pot', type: 'pot', x: 8.5, y: 9.5 },
            { id: 'archives-lamp', type: 'lamp', x: 16.5, y: 5.5 },
            { id: 'archives-plant', type: 'plant', x: 1.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'archives-vault',
                x: 15.5,
                y: 1.5,
                title: 'SEALED VAULT',
                message: 'A hidden archive vault has been forced open.',
                value: 275,
            },
            {
                id: 'archives-ledger',
                x: 10.5,
                y: 9.5,
                title: 'LEDGER CACHE',
                message: 'A secret records locker has been discovered.',
                value: 275,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m7-furnace',
        name: 'Episode 2: Furnace Works',
        meta: {
            episode: 2,
            floor: 7,
            theme: 'furnace',
        },
        nextLevelId: 'e2m8-keep',
        metadata: {
            briefing: 'Push through the furnace works, survive the heavy metal halls and seize the silver route into the keep.',
            primaryObjective: 'Recover the silver key from the furnace floor and unlock the keep approach.',
            bonusObjective: 'Strip the coolant stations and maintenance cages before advancing.',
        },
        layout: [
            '##################',
            '#>.....D........##',
            '#.====.######.##.#',
            '#.#............#.#',
            '#.#.~==~.####.#.##',
            '#.#......#....#.##',
            '#.######.#.####.##',
            '#......#.#....S.E#',
            '###.##.#.####.####',
            '#...##.#....#.#..#',
            '#.#....####.#.#..#',
            '#.#.##......#....#',
            '#...##############',
            '##################',
        ],
        entities: [
            {
                id: 'furnace-officer-a',
                type: 'officer',
                x: 10.5,
                y: 1.5,
                patrolPoints: [
                    { x: 10.5, y: 1.5 },
                    { x: 14.5, y: 1.5 },
                ],
            },
            {
                id: 'furnace-officer-b',
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
                id: 'furnace-guard-a',
                type: 'guard',
                x: 4.5,
                y: 3.5,
                patrolPoints: [
                    { x: 4.5, y: 3.5 },
                    { x: 8.5, y: 3.5 },
                ],
            },
            {
                id: 'furnace-guard-b',
                type: 'guard',
                x: 12.5,
                y: 7.5,
                patrolPoints: [
                    { x: 12.5, y: 7.5 },
                    { x: 13.5, y: 7.5 },
                ],
            },
            {
                id: 'furnace-commander-a',
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
                id: 'furnace-officer-c',
                type: 'officer',
                x: 8.5,
                y: 11.5,
                patrolPoints: [
                    { x: 8.5, y: 11.5 },
                    { x: 11.5, y: 11.5 },
                ],
            },
            {
                id: 'furnace-dog-a',
                type: 'dog',
                x: 2.5,
                y: 9.5,
                patrolPoints: [
                    { x: 2.5, y: 9.5 },
                    { x: 3.5, y: 9.5 },
                ],
            },
        ],
        pickups: [
            { id: 'furnace-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'furnace-medkit-a', type: 'medkit', x: 7.5, y: 3.5, amount: 15 },
            { id: 'furnace-armor-a', type: 'armor', x: 13.5, y: 5.5, amount: 32 },
            { id: 'furnace-silver-key', type: 'silver-key', x: 3.5, y: 12.5, amount: 1 },
            { id: 'furnace-treasure-a', type: 'treasure', x: 11.5, y: 9.5, amount: 1, value: 600, label: 'FURNACE BOND' },
            { id: 'furnace-ammo-b', type: 'ammo', x: 16.5, y: 9.5, amount: 12 },
            { id: 'furnace-medkit-b', type: 'medkit', x: 5.5, y: 5.5, amount: 12 },
            { id: 'furnace-rations', type: 'food', x: 1.5, y: 2.5, amount: 8 },
        ],
        props: [
            { id: 'furnace-barrel', type: 'barrel', x: 4.5, y: 5.5 },
            { id: 'furnace-column', type: 'column', x: 10.5, y: 9.5 },
            { id: 'furnace-table', type: 'table', x: 12.5, y: 3.5 },
            { id: 'furnace-lamp', type: 'lamp', x: 16.5, y: 3.5 },
            { id: 'furnace-pot', type: 'pot', x: 1.5, y: 2.5 },
        ],
        secrets: [
            {
                id: 'furnace-vault',
                x: 13.5,
                y: 9.5,
                title: 'COOLANT VAULT',
                message: 'A hidden furnace coolant vault has been opened.',
                value: 275,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m8-keep',
        name: 'Episode 2: Keep Approach',
        meta: {
            episode: 2,
            floor: 8,
            theme: 'keep',
        },
        nextLevelId: 'e2m9-stronghold',
        metadata: {
            briefing: 'Advance on the keep, recover both keys and break the layered gate into the stronghold apex.',
            primaryObjective: 'Secure the silver and gold keys, then unlock the stronghold lift.',
            bonusObjective: 'Search the keep pockets for relics and reserve munitions before the final breach.',
        },
        layout: [
            '##################',
            '#>....D....#..G.E#',
            '#.!&&!.###.#.#####',
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
                id: 'keep-guard-a',
                type: 'guard',
                x: 8.5,
                y: 1.5,
                patrolPoints: [
                    { x: 8.5, y: 1.5 },
                    { x: 10.5, y: 1.5 },
                ],
            },
            {
                id: 'keep-officer-a',
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
                id: 'keep-commander-a',
                type: 'commander',
                x: 9.5,
                y: 11.5,
                patrolPoints: [
                    { x: 9.5, y: 11.5 },
                    { x: 10.5, y: 11.5 },
                ],
            },
            {
                id: 'keep-officer-b',
                type: 'officer',
                x: 15.5,
                y: 3.5,
                patrolPoints: [
                    { x: 15.5, y: 3.5 },
                    { x: 16.5, y: 3.5 },
                ],
            },
            {
                id: 'keep-guard-b',
                type: 'guard',
                x: 4.5,
                y: 7.5,
                patrolPoints: [
                    { x: 4.5, y: 7.5 },
                    { x: 4.5, y: 9.5 },
                ],
            },
            {
                id: 'keep-guard-c',
                type: 'guard',
                x: 13.5,
                y: 10.5,
                patrolPoints: [
                    { x: 13.5, y: 10.5 },
                    { x: 14.5, y: 10.5 },
                ],
            },
            {
                id: 'keep-commander-b',
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
            { id: 'keep-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'keep-medkit-a', type: 'medkit', x: 7.5, y: 5.5, amount: 16 },
            { id: 'keep-armor-a', type: 'armor', x: 13.5, y: 3.5, amount: 35 },
            { id: 'keep-silver-key', type: 'silver-key', x: 3.5, y: 5.5, amount: 1 },
            { id: 'keep-gold-key', type: 'gold-key', x: 3.5, y: 11.5, amount: 1 },
            { id: 'keep-treasure-a', type: 'treasure', x: 13.5, y: 7.5, amount: 1, value: 650, label: 'KEEP SEAL' },
            { id: 'keep-rations', type: 'food', x: 16.5, y: 5.5, amount: 8 },
            { id: 'keep-ammo-b', type: 'ammo', x: 15.5, y: 11.5, amount: 12 },
        ],
        props: [
            { id: 'keep-barrel', type: 'barrel', x: 2.5, y: 7.5 },
            { id: 'keep-table', type: 'table', x: 8.5, y: 7.5 },
            { id: 'keep-column', type: 'column', x: 12.5, y: 9.5 },
            { id: 'keep-lamp', type: 'lamp', x: 16.5, y: 11.5 },
        ],
        secrets: [
            {
                id: 'keep-relic',
                x: 12.5,
                y: 5.5,
                title: 'KEEP RELIC',
                message: 'A hidden keep reliquary has been opened.',
                value: 300,
            },
        ],
        exit: {
            facing: 'east',
        },
    }),
    createLevel({
        id: 'e2m9-stronghold',
        name: 'Episode 2: Iron Stronghold',
        meta: {
            episode: 2,
            floor: 9,
            theme: 'stronghold',
        },
        nextLevelId: null,
        metadata: {
            briefing: 'Break the iron stronghold, recover the final key and kill the garrison boss to finish the campaign.',
            primaryObjective: 'Kill the boss, unlock the stronghold elevator and complete the campaign.',
            bonusObjective: 'Raid the command vaults and sealed observatory caches before extraction.',
        },
        layout: [
            '##################',
            '#>.....D........##',
            '#.!!!!.######.##.#',
            '#.#............#.#',
            '#.#.~~!!.####.#.##',
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
                id: 'stronghold-officer-a',
                type: 'officer',
                x: 10.5,
                y: 1.5,
                patrolPoints: [
                    { x: 10.5, y: 1.5 },
                    { x: 14.5, y: 1.5 },
                ],
            },
            {
                id: 'stronghold-officer-b',
                type: 'officer',
                x: 7.5,
                y: 3.5,
                patrolPoints: [
                    { x: 7.5, y: 3.5 },
                    { x: 12.5, y: 3.5 },
                ],
            },
            {
                id: 'stronghold-officer-c',
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
                id: 'stronghold-guard-a',
                type: 'guard',
                x: 2.5,
                y: 7.5,
                patrolPoints: [
                    { x: 2.5, y: 7.5 },
                    { x: 5.5, y: 7.5 },
                ],
            },
            {
                id: 'stronghold-commander-a',
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
                id: 'stronghold-commander-b',
                type: 'commander',
                x: 10.5,
                y: 9.5,
                patrolPoints: [
                    { x: 10.5, y: 9.5 },
                    { x: 11.5, y: 9.5 },
                ],
            },
            {
                id: 'stronghold-boss',
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
            { id: 'stronghold-ammo-a', type: 'ammo', x: 3.5, y: 1.5, amount: 10 },
            { id: 'stronghold-medkit-a', type: 'medkit', x: 7.5, y: 3.5, amount: 16 },
            { id: 'stronghold-armor-a', type: 'armor', x: 13.5, y: 5.5, amount: 35 },
            { id: 'stronghold-gold-key', type: 'gold-key', x: 16.5, y: 11.5, amount: 1 },
            { id: 'stronghold-treasure-a', type: 'treasure', x: 10.5, y: 7.5, amount: 1, value: 750, label: 'IRON CROWN' },
            { id: 'stronghold-rations', type: 'food', x: 16.5, y: 9.5, amount: 8 },
            { id: 'stronghold-ammo-b', type: 'ammo', x: 2.5, y: 12.5, amount: 12 },
            { id: 'stronghold-medkit-b', type: 'medkit', x: 13.5, y: 11.5, amount: 18 },
        ],
        props: [
            { id: 'stronghold-column', type: 'column', x: 3.5, y: 3.5 },
            { id: 'stronghold-table', type: 'table', x: 11.5, y: 3.5 },
            { id: 'stronghold-skeleton', type: 'skeleton', x: 3.5, y: 11.5 },
            { id: 'stronghold-lamp', type: 'lamp', x: 3.5, y: 9.5 },
        ],
        secrets: [
            {
                id: 'stronghold-vault',
                x: 12.5,
                y: 5.5,
                title: 'STRONGHOLD VAULT',
                message: 'The final command vault has been cracked open.',
                value: 325,
            },
            {
                id: 'stronghold-observatory',
                x: 15.5,
                y: 12.5,
                title: 'OBSERVATORY CACHE',
                message: 'A hidden observatory locker has been breached.',
                value: 325,
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
