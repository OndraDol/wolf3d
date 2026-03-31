/**
 * Enemy archetypes and shared patrol/chase/attack state machine.
 */

import { moveCircle } from '../engine/collision.js';

export const EnemyState = {
    STAND: 'stand',
    PATROL: 'patrol',
    CHASE: 'chase',
    ATTACK: 'attack',
    PAIN: 'pain',
    DEATH: 'death',
};

const PATROL_EPSILON = 0.12;
const PAIN_TIME = 0.18;
const LOSE_SIGHT_TIMEOUT = 1.2;

const ENEMY_ARCHETYPES = {
    guard: {
        id: 'guard',
        health: 42,
        speed: 1.05,
        chaseSpeed: 1.6,
        radius: 0.16,
        aggroRange: 6.8,
        retreatRange: 0,
        attack: {
            type: 'hitscan',
            range: 2.1,
            damage: 11,
            cooldown: 0.92,
            windup: 0.18,
        },
    },
    officer: {
        id: 'officer',
        health: 30,
        speed: 1.1,
        chaseSpeed: 1.35,
        radius: 0.16,
        aggroRange: 8.5,
        retreatRange: 2.8,
        attack: {
            type: 'projectile',
            range: 7.5,
            damage: 14,
            cooldown: 1.35,
            windup: 0.28,
            projectileSpeed: 4.2,
            projectileRadius: 0.09,
            projectileType: 'plasma',
            ttl: 3.2,
        },
    },
    dog: {
        id: 'dog',
        health: 18,
        speed: 1.32,
        chaseSpeed: 2.3,
        radius: 0.16,
        aggroRange: 7.2,
        retreatRange: 0,
        attack: {
            type: 'hitscan',
            range: 1.12,
            damage: 9,
            cooldown: 0.62,
            windup: 0.12,
        },
    },
    commander: {
        id: 'commander',
        health: 110,
        speed: 1.18,
        chaseSpeed: 1.9,
        radius: 0.18,
        aggroRange: 10.5,
        retreatRange: 1.2,
        attack: {
            type: 'burst',
            range: 6.4,
            cooldown: 1.22,
            windup: 0.26,
            burstShots: 3,
            spread: 0.09,
            damageMin: 5,
            damageMax: 8,
        },
    },
    boss: {
        id: 'boss',
        health: 260,
        speed: 0.92,
        chaseSpeed: 1.28,
        radius: 0.24,
        aggroRange: 12,
        retreatRange: 0,
        attack: {
            type: 'burst',
            range: 9.2,
            cooldown: 0.92,
            windup: 0.22,
            burstShots: 5,
            spread: 0.12,
            damageMin: 6,
            damageMax: 11,
        },
    },
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getIdleState(enemy) {
    return enemy.patrolPoints.length > 1 ? EnemyState.PATROL : EnemyState.STAND;
}

export function getEnemyArchetype(type = 'guard') {
    return ENEMY_ARCHETYPES[type] ?? ENEMY_ARCHETYPES.guard;
}

export class Enemy {
    constructor(x, y, type = 'guard', options = {}) {
        this.id = options.id ?? null;
        this.x = x;
        this.y = y;
        this.type = type;
        this.archetype = getEnemyArchetype(type);
        this.state = EnemyState.STAND;
        const healthMult = options.healthMultiplier ?? 1;
        this.health = Math.round(this.archetype.health * healthMult);
        this.damageMultiplier = options.damageMultiplier ?? 1;
        this.speed = this.archetype.speed;
        this.chaseSpeed = this.archetype.chaseSpeed;
        this.angle = options.angle ?? 0;
        this.animationTime = 0;
        this.loseSightTimer = 0;
        this.attackCooldown = 0;
        this.attackTimer = 0;
        this.attackPending = false;
        this.painTimer = 0;
        this.deathTimer = 0;
        this.radius = this.archetype.radius;
        this.spriteDirection = null;
        this.patrolPoints = options.patrolPoints?.length
            ? options.patrolPoints.map((point) => ({ x: point.x, y: point.y }))
            : [{ x, y }];
        this.patrolIndex = 0;
        this.state = getIdleState(this);
    }

    isAlive() {
        return this.state !== EnemyState.DEATH;
    }

    canSeeTarget(target, map, maxRange = this.archetype.aggroRange) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance > maxRange) {
            return false;
        }

        const steps = Math.max(4, Math.ceil(distance / 0.08));
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const sampleX = this.x + dx * t;
            const sampleY = this.y + dy * t;

            if (map.isWall(sampleX, sampleY)) {
                return false;
            }
        }

        return true;
    }

    takeDamage(amount) {
        if (!this.isAlive()) {
            return { hit: false, killed: false };
        }

        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.state = EnemyState.DEATH;
            this.deathTimer = 0;
            this.attackTimer = 0;
            this.attackPending = false;
            this.painTimer = 0;
            return { hit: true, killed: true };
        }

        this.state = EnemyState.PAIN;
        this.painTimer = PAIN_TIME;
        this.attackTimer = 0;
        this.attackPending = false;
        return { hit: true, killed: false };
    }

    update(dt, player, map, gameState, context = {}) {
        this.animationTime += dt;
        this.attackCooldown = Math.max(0, this.attackCooldown - dt);

        if (!this.isAlive()) {
            this.deathTimer += dt;
            return;
        }

        if (this.painTimer > 0) {
            this.painTimer = Math.max(0, this.painTimer - dt);
            if (this.painTimer > 0) {
                return;
            }
            this.state = this.loseSightTimer > 0 ? EnemyState.CHASE : getIdleState(this);
        }

        if (this.attackTimer > 0) {
            this.attackTimer = Math.max(0, this.attackTimer - dt);
            if (this.attackTimer > 0) {
                return;
            }

            if (this.attackPending) {
                this.performAttack(player, map, gameState, context);
                this.attackPending = false;
            }

            this.state = this.loseSightTimer > 0 ? EnemyState.CHASE : getIdleState(this);
        }

        const canSeePlayer = this.canSeeTarget(player, map);
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distanceToPlayer = Math.hypot(dx, dy);

        if (distanceToPlayer > 0.0001) {
            this.angle = Math.atan2(dy, dx);
        }

        if (canSeePlayer) {
            this.state = EnemyState.CHASE;
            this.loseSightTimer = LOSE_SIGHT_TIMEOUT;
        } else if (this.state === EnemyState.CHASE || this.loseSightTimer > 0) {
            this.loseSightTimer = Math.max(0, this.loseSightTimer - dt);
            if (this.loseSightTimer <= 0) {
                this.state = getIdleState(this);
            }
        }

        const attack = this.archetype.attack;
        const inAttackRange = canSeePlayer && distanceToPlayer <= attack.range;
        const tooClose = distanceToPlayer < this.archetype.retreatRange;

        if (inAttackRange && this.attackCooldown <= 0 && !(attack.type === 'projectile' && tooClose)) {
            this.state = EnemyState.ATTACK;
            this.attackCooldown = attack.cooldown;
            this.attackTimer = attack.windup;
            this.attackPending = true;
            return;
        }

        if (this.state === EnemyState.CHASE) {
            if (attack.type === 'projectile' && canSeePlayer && tooClose) {
                this.moveAwayFrom(player.x, player.y, this.chaseSpeed * 0.92, dt, map);
                return;
            }

            this.moveToward(player.x, player.y, this.chaseSpeed, dt, map);
            return;
        }

        if (this.state === EnemyState.PATROL) {
            const target = this.patrolPoints[this.patrolIndex];
            if (this.moveToward(target.x, target.y, this.speed, dt, map) < PATROL_EPSILON) {
                this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
            }
        }
    }

    performAttack(player, map, gameState, context) {
        const attack = this.archetype.attack;
        const distanceToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (!this.canSeeTarget(player, map, attack.range + 0.25) || distanceToPlayer > attack.range + 0.25) {
            return;
        }

        if (attack.type === 'burst') {
            const totalDamage = this.performBurstAttack(player, attack);
            if (totalDamage > 0) {
                gameState?.applyDamage(Math.round(totalDamage * this.damageMultiplier));
            }
            context.playSound?.('enemy-shot');
            return;
        }

        if (attack.type === 'projectile') {
            const dirX = Math.cos(this.angle);
            const dirY = Math.sin(this.angle);
            context.spawnProjectile?.({
                owner: 'enemy',
                type: attack.projectileType,
                x: this.x + dirX * 0.28,
                y: this.y + dirY * 0.28,
                dx: dirX,
                dy: dirY,
                speed: attack.projectileSpeed,
                radius: attack.projectileRadius,
                ttl: attack.ttl,
                damage: Math.round(attack.damage * this.damageMultiplier),
                sourceId: this.id,
            });
            context.playSound?.('enemy-shot');
            return;
        }

        const damage = Math.round((attack.damage + Math.round(Math.random() * 3)) * this.damageMultiplier);
        gameState?.applyDamage(clamp(damage, 1, 99));
    }

    performBurstAttack(player, attack) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        let totalDamage = 0;

        for (let shot = 0; shot < attack.burstShots; shot++) {
            const shotAngle = this.angle + ((Math.random() - 0.5) * attack.spread);
            const dirX = Math.cos(shotAngle);
            const dirY = Math.sin(shotAngle);
            const along = (dx * dirX) + (dy * dirY);
            const lateral = Math.abs((dx * dirY) - (dy * dirX));
            const tolerance = (player.radius ?? 0.2) + along * 0.028;

            if (along <= 0 || along > attack.range || lateral > tolerance) {
                continue;
            }

            totalDamage += attack.damageMin + Math.floor(Math.random() * ((attack.damageMax - attack.damageMin) + 1));
        }

        return totalDamage;
    }

    moveToward(targetX, targetY, speed, dt, map) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= PATROL_EPSILON) {
            return distance;
        }

        this.angle = Math.atan2(dy, dx);

        const step = Math.min(distance, speed * dt);
        const moveX = (dx / distance) * step;
        const moveY = (dy / distance) * step;

        moveCircle(map, this, moveX, moveY);

        return Math.hypot(targetX - this.x, targetY - this.y);
    }

    moveAwayFrom(targetX, targetY, speed, dt, map) {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        const distance = Math.hypot(dx, dy);

        if (distance <= 0.001) {
            return 0;
        }

        this.angle = Math.atan2(targetY - this.y, targetX - this.x);

        const step = Math.min(speed * dt, 0.45);
        moveCircle(map, this, (dx / distance) * step, (dy / distance) * step);

        return Math.hypot(targetX - this.x, targetY - this.y);
    }
}
