/**
 * Main entry point and gameplay loop.
 */

import { Enemy } from '../ai/enemy.js';
import { initAudio, playSound } from '../audio/synth.js';
import { GameState } from '../game/state.js';
import { getLevel, loadLevel } from '../game/level.js';
import { getWeapon, getWeaponBySlot, WEAPON_ORDER } from '../game/weapons.js';
import { initTextures } from '../procedural/textures.js';
import { spriteGenerator } from '../sprites/SpriteGenerator.js';
import { drawHUD } from '../renderer/hud.js';
import { drawMinimap } from '../renderer/minimap.js';
import { Screen } from '../renderer/screen.js';
import { drawSprites } from '../renderer/sprites.js';
import { drawWalls } from '../renderer/walls.js';
import { Camera } from './camera.js';
import { circleCollidesWall } from './collision.js';
import { Input } from './input.js';
import { GameMap } from './map.js';
import { Raycaster } from './raycaster.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 400;
const VIEWPORT_HEIGHT = 320;
const STATUS_BAR_HEIGHT = SCREEN_HEIGHT - VIEWPORT_HEIGHT;
const TARGET_FPS = 60;
const DEFAULT_LEVEL_ID = 'e1m1-skeleton';
const FIRE_KEYS = ['ControlLeft', 'ControlRight', 'Enter', 'KeyF'];
const START_KEYS = ['Enter', 'Space'];
const RESTART_KEYS = ['Enter', 'KeyR'];
const HELP_KEYS = ['KeyH', 'Slash'];
const PICKUP_RANGE = 0.55;
const EXIT_RANGE = 1.4;

let screen;
let camera;
let map;
let input;
let raycaster;
let level;
let entities;
let pickups;
let props;
let projectiles;
let secrets;
let gameState;
let runStartLevelId;
let nextProjectileId = 1;

const renderFrame = {
    camera: null,
    map: null,
    level: null,
    entities: [],
    pickups: [],
    props: [],
    projectiles: [],
    exit: null,
    rays: null,
    depthBuffer: null,
    gameState: null,
};

let lastTime = 0;
let frameCount = 0;
let fpsAccumulator = 0;
const fpsElement = document.getElementById('fps');

function getRequestedLevelId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('level') ?? DEFAULT_LEVEL_ID;
}

function unlockAudio() {
    initAudio();
}

function createRuntimePickup(pickup) {
    return {
        ...pickup,
        collected: false,
    };
}

function createRuntimeSecret(secret) {
    return {
        ...secret,
        discovered: false,
    };
}

function syncRenderFrame() {
    renderFrame.camera = camera;
    renderFrame.map = map;
    renderFrame.level = level;
    renderFrame.entities = entities;
    renderFrame.pickups = pickups;
    renderFrame.props = props;
    renderFrame.projectiles = projectiles;
    renderFrame.exit = level.exit;
    renderFrame.rays = raycaster.rays;
    renderFrame.depthBuffer = raycaster.depthBuffer;
    renderFrame.gameState = gameState;
}

function loadWorld(levelId, options = {}) {
    level = loadLevel(levelId);
    map = new GameMap(level);
    camera = new Camera(map, level.playerStart);
    raycaster = new Raycaster(map, SCREEN_WIDTH, VIEWPORT_HEIGHT);
    entities = level.entities.map((entity) => new Enemy(entity.x, entity.y, entity.type, entity));
    pickups = level.pickups.map(createRuntimePickup);
    props = level.props.map((prop) => ({ ...prop }));
    projectiles = [];
    secrets = level.secrets.map(createRuntimeSecret);
    nextProjectileId = 1;

    gameState.prepareLevel(level, {
        preservePlayerState: options.preservePlayerState ?? true,
        enemiesTotal: entities.length,
        pickupsTotal: pickups.length,
        treasuresTotal: level.pickups.filter((pickup) => pickup.type === 'treasure').length,
        secretsTotal: level.secrets.length,
        status: options.status ?? 'playing',
    });

    camera.keys = gameState.keys;
    syncRenderFrame();
}

function init() {
    const canvas = document.getElementById('screen');

    runStartLevelId = getRequestedLevelId();
    screen = new Screen(canvas, SCREEN_WIDTH, SCREEN_HEIGHT, VIEWPORT_HEIGHT);
    input = new Input();
    gameState = new GameState();
    initTextures();
    spriteGenerator.preload();

    loadWorld(runStartLevelId, { preservePlayerState: false, status: 'title' });

    window.addEventListener('resize', () => screen.resize());
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    screen.resize();

    requestAnimationFrame(loop);
}

function loop(timestamp) {
    const rawDt = lastTime ? (timestamp - lastTime) / 1000 : 1 / TARGET_FPS;
    const dt = Math.min(rawDt, 0.05);
    lastTime = timestamp;

    frameCount++;
    fpsAccumulator += dt;
    if (fpsAccumulator >= 0.5) {
        fpsElement.textContent = `FPS: ${Math.round(frameCount / fpsAccumulator)}`;
        frameCount = 0;
        fpsAccumulator = 0;
    }

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

function startRun() {
    loadWorld(runStartLevelId, { preservePlayerState: false, status: 'playing' });
    playSound('start-game');
}

function restartRun() {
    gameState.resetRun();
    loadWorld(runStartLevelId, { preservePlayerState: false, status: 'title' });
}

function restartFloor() {
    gameState.prepareRetryState();
    loadWorld(gameState.currentLevelId, { preservePlayerState: true, status: 'playing' });
}

function spawnProjectile(spec) {
    const length = Math.hypot(spec.dx, spec.dy) || 1;
    projectiles.push({
        id: `projectile-${nextProjectileId++}`,
        owner: spec.owner ?? 'enemy',
        type: spec.type ?? 'plasma',
        x: spec.x,
        y: spec.y,
        dx: spec.dx / length,
        dy: spec.dy / length,
        speed: spec.speed ?? 4,
        radius: spec.radius ?? 0.08,
        ttl: spec.ttl ?? 3,
        damage: spec.damage ?? 8,
        sourceId: spec.sourceId ?? null,
        age: 0,
        dead: false,
    });
}

function getExitInFront() {
    if (!level.exit) {
        return null;
    }

    const exitTileX = Math.floor(level.exit.x);
    const exitTileY = Math.floor(level.exit.y);
    const dirX = Math.cos(camera.angle);
    const dirY = Math.sin(camera.angle);

    for (let distance = 0.35; distance <= EXIT_RANGE; distance += 0.05) {
        const sampleX = camera.x + dirX * distance;
        const sampleY = camera.y + dirY * distance;
        const tileX = Math.floor(sampleX);
        const tileY = Math.floor(sampleY);

        if (tileX === exitTileX && tileY === exitTileY) {
            return level.exit;
        }

        const tile = map.getTile(sampleX, sampleY);
        if (tileX === exitTileX && tileY === exitTileY) {
            continue;
        }
        if (map.isWallTile(tile) || map.isDoorBlockingPath(tileX, tileY)) {
            return null;
        }
    }

    return null;
}

function handleInteraction() {
    const door = map.findDoorInDirection(camera.x, camera.y, camera.angle);
    if (door) {
        if (!map.canUnlockDoor(door, camera)) {
            gameState.setMessage(`NEED ${door.lock.toUpperCase()} KEY`, 1.2);
            playSound('locked');
            return;
        }

        if (map.openDoor(door, camera)) {
            playSound('door');
        }
        return;
    }

    if (getExitInFront()) {
        if (level.exit?.requiresKillTypes?.length) {
            const remaining = entities.filter(
                (entity) => entity.isAlive() && level.exit.requiresKillTypes.includes(entity.type)
            );
            if (remaining.length > 0) {
                const blockerLabel = remaining.some((entity) => entity.type === 'boss') ? 'BOSS' : 'GUARD';
                gameState.setMessage(`${blockerLabel} STILL ACTIVE`, 1.3);
                playSound('locked');
                return;
            }
        }
        const nextLevel = gameState.nextLevelId ? getLevel(gameState.nextLevelId) : null;
        gameState.finishLevel(nextLevel);
        playSound('level-complete');
    }
}

function pickShootTargetForAngle(shotAngle, range, tolerance) {
    const dirX = Math.cos(shotAngle);
    const dirY = Math.sin(shotAngle);
    let bestTarget = null;
    let bestDistance = Infinity;

    for (const entity of entities) {
        if (!entity.isAlive()) {
            continue;
        }

        const dx = entity.x - camera.x;
        const dy = entity.y - camera.y;
        const along = (dx * dirX) + (dy * dirY);
        if (along <= 0.12 || along > range) {
            continue;
        }

        const perpendicular = Math.abs((dx * dirY) - (dy * dirX));
        const allowedOffset = tolerance + (entity.radius * 0.65) + along * 0.02;
        if (perpendicular > allowedOffset) {
            continue;
        }

        if (!entity.canSeeTarget(camera, map, along + 0.25)) {
            continue;
        }

        if (along < bestDistance) {
            bestDistance = along;
            bestTarget = entity;
        }
    }

    return bestTarget;
}

function rollDamage(weapon) {
    return weapon.damageMin + Math.floor(Math.random() * (weapon.damageMax - weapon.damageMin + 1));
}

function resolveWeaponFire(weapon) {
    const hitMap = new Map();

    for (let pellet = 0; pellet < weapon.pellets; pellet++) {
        const offset = weapon.pellets === 1 ? 0 : ((Math.random() - 0.5) * weapon.spread);
        const target = pickShootTargetForAngle(camera.angle + offset, weapon.range, weapon.tolerance);
        if (!target) {
            continue;
        }

        const impact = hitMap.get(target) ?? { damage: 0, pellets: 0 };
        impact.damage += rollDamage(weapon);
        impact.pellets += 1;
        hitMap.set(target, impact);
    }

    let hits = 0;
    let kills = 0;
    for (const [target, impact] of hitMap.entries()) {
        const result = target.takeDamage(impact.damage);
        if (!result.hit) {
            continue;
        }

        hits += 1;
        if (result.killed) {
            kills += 1;
            gameState.registerKill();
        }
    }

    return { hits, kills };
}

function handleWeaponSelection() {
    for (let slot = 1; slot <= WEAPON_ORDER.length; slot++) {
        if (!input.consumePressed(`Digit${slot}`)) {
            continue;
        }

        const weapon = getWeaponBySlot(slot);
        if (!weapon || weapon.id === gameState.weapon || !gameState.selectWeapon(weapon.id)) {
            continue;
        }

        gameState.setMessage(weapon.label, 0.7);
        playSound('weapon-switch');
    }
}

function handleShellInput() {
    if (input.consumePressed('Escape')) {
        if (gameState.showHelp) {
            gameState.closeShellOverlay();
            return;
        }

        if (gameState.togglePause()) {
            gameState.setMessage(gameState.paused ? 'PAUSED' : 'RESUME', 0.6);
        }
    }

    if (input.consumeAnyPressed(HELP_KEYS)) {
        const helpOpen = gameState.toggleHelp();
        gameState.setMessage(helpOpen ? 'HELP' : 'BACK TO RUN', 0.6);
    }
}

function handleWeaponFire() {
    if (!input.consumeAnyPressed(FIRE_KEYS)) {
        return;
    }

    if (!gameState.canFire()) {
        return;
    }

    const weapon = getWeapon(gameState.weapon);
    if (!gameState.consumeAmmo(weapon.ammoCost)) {
        gameState.weaponCooldown = 0.14;
        gameState.setMessage('NO AMMO', 0.8);
        playSound('dry-fire');
        return;
    }

    gameState.beginShot(weapon);
    playSound(weapon.sound);

    const result = resolveWeaponFire(weapon);
    if (result.kills > 1) {
        gameState.setMessage(`${result.kills} ENEMIES DOWN`, 0.9);
        playSound('enemy-death');
        return;
    }

    if (result.kills === 1) {
        gameState.setMessage('ENEMY DOWN', 0.8);
        playSound('enemy-death');
        return;
    }

    if (result.hits > 0) {
        gameState.setMessage(weapon.id === 'shotgun' ? 'SOLID HIT' : 'TARGET HIT', 0.45);
        playSound('enemy-hit');
    }
}

function collectPickups() {
    for (const pickup of pickups) {
        if (pickup.collected) {
            continue;
        }

        if (Math.hypot(pickup.x - camera.x, pickup.y - camera.y) > PICKUP_RANGE) {
            continue;
        }

        let collected = false;
        let message = '';
        let sound = 'pickup';

        switch (pickup.type) {
            case 'knife':
                collected = gameState.unlockWeapon('knife');
                message = collected ? 'KNIFE ACQUIRED' : '';
                sound = 'weapon-pickup';
                break;
            case 'pistol':
                collected = gameState.unlockWeapon('pistol');
                message = collected ? 'PISTOL ACQUIRED' : '';
                sound = 'weapon-pickup';
                break;
            case 'ammo': {
                const gained = gameState.addAmmo(pickup.amount);
                if (gained > 0) {
                    collected = true;
                    message = `AMMO +${gained}`;
                }
                break;
            }
            case 'medkit': {
                const healed = gameState.heal(pickup.amount);
                if (healed > 0) {
                    collected = true;
                    message = `HEALTH +${healed}`;
                }
                break;
            }
            case 'armor': {
                const gained = gameState.addArmor(pickup.amount);
                if (gained > 0) {
                    collected = true;
                    message = `ARMOR +${gained}`;
                }
                break;
            }
            case 'shotgun':
                collected = gameState.unlockWeapon('shotgun');
                message = collected ? 'SHOTGUN ACQUIRED' : '';
                sound = 'weapon-pickup';
                break;
            case 'machinegun':
                collected = gameState.unlockWeapon('machinegun');
                message = collected ? 'MACHINEGUN ACQUIRED' : '';
                sound = 'weapon-pickup';
                break;
            case 'chaingun':
                collected = gameState.unlockWeapon('chaingun');
                message = collected ? 'CHAINGUN ACQUIRED' : '';
                sound = 'weapon-pickup';
                break;
            case 'food': {
                const healed = gameState.heal(pickup.amount);
                if (healed > 0) {
                    collected = true;
                    message = `RATIONS +${healed}`;
                }
                break;
            }
            case 'treasure':
                collected = true;
                message = pickup.label || 'TREASURE';
                sound = 'treasure';
                gameState.registerTreasure(pickup.value || 100);
                break;
            case 'gold-key':
                if (!gameState.hasKey('gold')) {
                    gameState.addKey('gold');
                    collected = true;
                    message = 'GOLD KEY';
                }
                break;
            case 'silver-key':
                if (!gameState.hasKey('silver')) {
                    gameState.addKey('silver');
                    collected = true;
                    message = 'SILVER KEY';
                }
                break;
            default:
                break;
        }

        if (!collected) {
            continue;
        }

        pickup.collected = true;
        gameState.registerPickup();
        gameState.triggerPickupFlash(pickup.type === 'treasure' ? 0.26 : 0.16);
        gameState.setMessage(
            message,
            ['knife', 'pistol', 'shotgun', 'machinegun', 'chaingun'].includes(pickup.type) ? 1.4 : 1
        );
        playSound(sound);
    }
}

function updateProjectiles(dt) {
    for (const projectile of projectiles) {
        if (projectile.dead) {
            continue;
        }

        projectile.age += dt;
        projectile.ttl -= dt;
        if (projectile.ttl <= 0) {
            projectile.dead = true;
            continue;
        }

        const distance = projectile.speed * dt;
        const steps = Math.max(1, Math.ceil(distance / 0.05));
        const stepX = (projectile.dx * distance) / steps;
        const stepY = (projectile.dy * distance) / steps;

        for (let step = 0; step < steps; step++) {
            const nextX = projectile.x + stepX;
            const nextY = projectile.y + stepY;

            if (circleCollidesWall(map, nextX, nextY, projectile.radius)) {
                projectile.dead = true;
                break;
            }

            projectile.x = nextX;
            projectile.y = nextY;

            if (projectile.owner === 'enemy') {
                const dx = projectile.x - camera.x;
                const dy = projectile.y - camera.y;
                const combinedRadius = (projectile.radius ?? 0.08) + (camera.radius ?? 0.2);
                if ((dx * dx) + (dy * dy) <= combinedRadius * combinedRadius) {
                    gameState.applyDamage(projectile.damage);
                    projectile.dead = true;
                    break;
                }
            }
        }
    }

    projectiles = projectiles.filter((projectile) => !projectile.dead);
    renderFrame.projectiles = projectiles;
}

function discoverSecrets() {
    for (const secret of secrets) {
        if (secret.discovered) {
            continue;
        }

        if (Math.hypot(secret.x - camera.x, secret.y - camera.y) > secret.radius) {
            continue;
        }

        secret.discovered = true;
        gameState.registerSecret(secret.value);
        gameState.setMessage(secret.title, 1.2);
        playSound('secret');
    }
}

function advanceFlowIfNeeded() {
    if (gameState.showHelp || gameState.paused) {
        return false;
    }

    if (gameState.levelStatus === 'title' && input.consumeAnyPressed(START_KEYS)) {
        startRun();
        return true;
    }

    if (gameState.levelStatus === 'intermission' && input.consumeAnyPressed(START_KEYS)) {
        loadWorld(gameState.pendingLevelId, { preservePlayerState: true, status: 'playing' });
        return true;
    }

    if (gameState.levelStatus === 'dead' && input.consumeAnyPressed(RESTART_KEYS)) {
        restartFloor();
        return true;
    }

    if (gameState.levelStatus === 'dead' && gameState.transitionTimer <= 0) {
        restartFloor();
        return true;
    }

    if (gameState.levelStatus === 'victory' && input.consumeAnyPressed(RESTART_KEYS)) {
        restartRun();
        return true;
    }

    return false;
}

function update(dt) {
    handleShellInput();
    gameState.tick(dt);

    if (advanceFlowIfNeeded()) {
        return;
    }

    if (gameState.isGameplayBlockedByOverlay()) {
        return;
    }

    if (!gameState.canPlayerAct()) {
        return;
    }

    handleWeaponSelection();
    camera.update(input, dt);

    if (input.consumePressed('Space')) {
        handleInteraction();
    }

    handleWeaponFire();
    collectPickups();
    discoverSecrets();

    const healthBefore = gameState.health;
    const enemyContext = {
        spawnProjectile,
        playSound,
    };
    for (const entity of entities) {
        entity.update(dt, camera, map, gameState, enemyContext);
    }
    updateProjectiles(dt);
    if (gameState.health < healthBefore) {
        playSound('player-hit');
    }

    map.update(dt, camera, entities.filter((entity) => entity.isAlive()));
}

function draw() {
    screen.clear();
    raycaster.castRays(camera);
    drawWalls(screen, renderFrame);
    drawSprites(screen, renderFrame);
    drawMinimap(screen, renderFrame);
    screen.present();
    drawHUD(screen.ctx, renderFrame);
}

init();
