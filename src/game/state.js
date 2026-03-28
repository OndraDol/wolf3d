/**
 * Lightweight runtime game state for the current run and level flow.
 */

const DEFAULT_HEALTH = 100;
const DEFAULT_AMMO = 8;
const DEFAULT_WEAPON = 'pistol';
const MAX_HEALTH = 100;
const MAX_AMMO = 99;
const MAX_ARMOR = 100;
const ARMOR_ABSORB_RATIO = 0.65;

export class GameState {
    constructor() {
        this.resetRun();
    }

    resetRun() {
        this.score = 0;
        this.lives = 3;
        this.kills = 0;
        this.treasures = 0;
        this.secrets = 0;
        this.levelsCompleted = 0;
        this.resetPlayerState();
        this.clearLevelState();
    }

    resetPlayerState() {
        this.health = DEFAULT_HEALTH;
        this.armor = 0;
        this.ammo = DEFAULT_AMMO;
        this.weapon = DEFAULT_WEAPON;
        this.weapons = new Set([DEFAULT_WEAPON]);
        this.keys = new Set();
    }

    prepareRetryState() {
        this.health = DEFAULT_HEALTH;
        this.armor = 0;
        this.ammo = Math.min(MAX_AMMO, Math.max(DEFAULT_AMMO, this.ammo));

        if (!this.weapons.has(this.weapon)) {
            this.weapon = this.weapons.has(DEFAULT_WEAPON) ? DEFAULT_WEAPON : [...this.weapons][0] ?? DEFAULT_WEAPON;
        }
    }

    clearLevelState() {
        this.currentLevelId = null;
        this.currentLevelName = '';
        this.currentLevelNumber = 0;
        this.nextLevelId = null;
        this.pendingLevelId = null;
        this.pendingLevelName = '';
        this.levelStatus = 'boot';
        this.levelMessage = '';
        this.levelMessageTimer = 0;
        this.transitionTimer = 0;
        this.weaponCooldown = 0;
        this.muzzleFlash = 0;
        this.weaponSwitchTimer = 0;
        this.weaponSwitchDuration = 0.18;
        this.weaponSwitchFrom = DEFAULT_WEAPON;
        this.damageFlash = 0;
        this.pickupFlash = 0;
        this.screenFade = 0;
        this.paused = false;
        this.showHelp = false;
        this.levelTime = 0;
        this.enemiesTotal = 0;
        this.killsInLevel = 0;
        this.pickupsTotal = 0;
        this.pickupsCollected = 0;
        this.treasuresTotal = 0;
        this.treasuresInLevel = 0;
        this.secretsTotal = 0;
        this.secretsInLevel = 0;
        this.lastCompletedLevel = null;
        this.lastHitAmount = 0;
    }

    prepareLevel(level, options = {}) {
        const preservePlayerState = options.preservePlayerState ?? true;

        if (!preservePlayerState) {
            this.resetPlayerState();
        }

        this.currentLevelId = level.id;
        this.currentLevelName = level.name;
        this.currentLevelNumber = level.meta?.floor ?? 0;
        this.nextLevelId = level.nextLevelId ?? null;
        this.pendingLevelId = null;
        this.pendingLevelName = '';
        this.levelStatus = options.status ?? 'playing';
        this.levelMessage = '';
        this.levelMessageTimer = 0;
        this.transitionTimer = 0;
        this.weaponCooldown = 0;
        this.muzzleFlash = 0;
        this.weaponSwitchTimer = 0;
        this.weaponSwitchFrom = this.weapon;
        this.damageFlash = 0;
        this.pickupFlash = 0;
        this.screenFade = options.screenFade ?? 0.42;
        this.paused = false;
        this.showHelp = false;
        this.levelTime = 0;
        this.enemiesTotal = options.enemiesTotal ?? 0;
        this.killsInLevel = 0;
        this.pickupsTotal = options.pickupsTotal ?? 0;
        this.pickupsCollected = 0;
        this.treasuresTotal = options.treasuresTotal ?? 0;
        this.treasuresInLevel = 0;
        this.secretsTotal = options.secretsTotal ?? 0;
        this.secretsInLevel = 0;
        this.lastHitAmount = 0;
    }

    tick(dt) {
        if (!this.isGameplayBlockedByOverlay()) {
            this.levelTime += this.levelStatus === 'playing' ? dt : 0;
            this.weaponCooldown = Math.max(0, this.weaponCooldown - dt);
            this.muzzleFlash = Math.max(0, this.muzzleFlash - dt);
            this.weaponSwitchTimer = Math.max(0, this.weaponSwitchTimer - dt);
            this.damageFlash = Math.max(0, this.damageFlash - dt);
            this.pickupFlash = Math.max(0, this.pickupFlash - dt * 1.4);
            this.screenFade = Math.max(0, this.screenFade - dt * 1.8);
            this.levelMessageTimer = Math.max(0, this.levelMessageTimer - dt);
            if (this.levelMessageTimer <= 0) {
                this.levelMessage = '';
            }

            if (this.transitionTimer > 0) {
                this.transitionTimer = Math.max(0, this.transitionTimer - dt);
            }
        }
    }

    canPlayerAct() {
        return this.levelStatus === 'playing'
            && this.health > 0
            && !this.paused
            && !this.showHelp;
    }

    canFire() {
        return this.canPlayerAct() && this.weaponCooldown <= 0;
    }

    beginShot(weapon) {
        this.weaponCooldown = weapon?.cooldown ?? 0.25;
        this.muzzleFlash = weapon?.muzzleFlash ?? 0.08;
    }

    setMessage(message, duration = 1.5) {
        this.levelMessage = message;
        this.levelMessageTimer = duration;
    }

    consumeAmmo(amount = 1) {
        if (this.ammo < amount) {
            return false;
        }

        this.ammo -= amount;
        return true;
    }

    addAmmo(amount) {
        const before = this.ammo;
        this.ammo = Math.min(MAX_AMMO, this.ammo + amount);
        return this.ammo - before;
    }

    heal(amount) {
        const before = this.health;
        this.health = Math.min(MAX_HEALTH, this.health + amount);
        return this.health - before;
    }

    addArmor(amount) {
        const before = this.armor;
        this.armor = Math.min(MAX_ARMOR, this.armor + amount);
        return this.armor - before;
    }

    triggerPickupFlash(intensity = 0.18) {
        this.pickupFlash = Math.max(this.pickupFlash, intensity);
    }

    addKey(keyType) {
        this.keys.add(keyType);
        this.score += 500;
    }

    hasKey(keyType) {
        return this.keys.has(keyType);
    }

    applyDamage(amount) {
        if (!this.canPlayerAct()) {
            return false;
        }

        let remainingDamage = amount;
        if (this.armor > 0) {
            const absorbed = Math.min(this.armor, Math.ceil(amount * ARMOR_ABSORB_RATIO));
            this.armor -= absorbed;
            remainingDamage -= absorbed;
        }

        this.health = Math.max(0, this.health - Math.max(1, remainingDamage));
        this.damageFlash = Math.max(this.damageFlash, 0.28);
        this.lastHitAmount = amount;

        if (this.health <= 0) {
            this.levelStatus = 'dead';
            this.transitionTimer = 2;
            this.setMessage('YOU DIED', 2);
        }

        return true;
    }

    registerKill() {
        this.kills += 1;
        this.killsInLevel += 1;
        this.score += 100;
    }

    registerPickup() {
        this.pickupsCollected += 1;
        this.score += 50;
    }

    registerTreasure(value = 100) {
        this.treasures += 1;
        this.treasuresInLevel += 1;
        this.score += value;
    }

    registerSecret(value = 150) {
        this.secrets += 1;
        this.secretsInLevel += 1;
        this.score += value;
    }

    unlockWeapon(weaponId) {
        const hadWeapon = this.weapons.has(weaponId);
        this.weapons.add(weaponId);
        if (!hadWeapon) {
            this.weaponSwitchFrom = this.weapon;
            this.weapon = weaponId;
            this.weaponSwitchTimer = this.weaponSwitchDuration;
            this.score += 250;
        }
        return !hadWeapon;
    }

    hasWeapon(weaponId) {
        return this.weapons.has(weaponId);
    }

    selectWeapon(weaponId) {
        if (!this.weapons.has(weaponId)) {
            return false;
        }

        if (weaponId === this.weapon) {
            return true;
        }

        this.weaponSwitchFrom = this.weapon;
        this.weapon = weaponId;
        this.weaponSwitchTimer = this.weaponSwitchDuration;
        return true;
    }

    togglePause() {
        if (this.levelStatus !== 'playing') {
            return false;
        }

        this.paused = !this.paused;
        if (this.paused) {
            this.showHelp = false;
        }
        return true;
    }

    toggleHelp() {
        this.showHelp = !this.showHelp;
        if (this.showHelp) {
            this.paused = false;
        }
        return this.showHelp;
    }

    closeShellOverlay() {
        const changed = this.paused || this.showHelp;
        this.paused = false;
        this.showHelp = false;
        return changed;
    }

    isGameplayBlockedByOverlay() {
        return this.paused || this.showHelp;
    }

    finishLevel(nextLevel = null) {
        if (this.levelStatus !== 'playing') {
            return;
        }

        this.levelsCompleted += 1;
        this.lastCompletedLevel = {
            id: this.currentLevelId,
            name: this.currentLevelName,
            floor: this.currentLevelNumber,
            time: this.levelTime,
            kills: this.killsInLevel,
            enemiesTotal: this.enemiesTotal,
            pickups: this.pickupsCollected,
            pickupsTotal: this.pickupsTotal,
            treasures: this.treasuresInLevel,
            treasuresTotal: this.treasuresTotal,
            secrets: this.secretsInLevel,
            secretsTotal: this.secretsTotal,
            health: this.health,
            armor: this.armor,
            score: this.score,
        };

        if (this.nextLevelId) {
            this.pendingLevelId = this.nextLevelId;
            this.pendingLevelName = nextLevel?.name ?? this.nextLevelId;
            this.levelStatus = 'intermission';
            this.transitionTimer = 0;
            this.setMessage('FLOOR SECURED', 2.2);
            return;
        }

        this.levelStatus = 'victory';
        this.transitionTimer = 0;
        this.setMessage('MISSION COMPLETE', 3);
    }
}
