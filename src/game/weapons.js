/**
 * Shared weapon metadata for player combat and HUD.
 */

const WEAPONS = {
    pistol: {
        id: 'pistol',
        slot: 1,
        label: 'PISTOL',
        ammoCost: 1,
        cooldown: 0.24,
        muzzleFlash: 0.08,
        pellets: 1,
        spread: 0.012,
        range: 9.5,
        tolerance: 0.2,
        damageMin: 18,
        damageMax: 34,
        sound: 'shot-pistol',
    },
    shotgun: {
        id: 'shotgun',
        slot: 2,
        label: 'SHOTGUN',
        ammoCost: 2,
        cooldown: 0.62,
        muzzleFlash: 0.14,
        pellets: 6,
        spread: 0.16,
        range: 7.2,
        tolerance: 0.28,
        damageMin: 6,
        damageMax: 13,
        sound: 'shot-shotgun',
    },
    machinegun: {
        id: 'machinegun',
        slot: 3,
        label: 'MACHINEGUN',
        ammoCost: 1,
        cooldown: 0.11,
        muzzleFlash: 0.09,
        pellets: 1,
        spread: 0.038,
        range: 8.6,
        tolerance: 0.24,
        damageMin: 10,
        damageMax: 18,
        sound: 'shot-machinegun',
    },
};

export const WEAPON_ORDER = ['pistol', 'shotgun', 'machinegun'];

export function getWeapon(weaponId = 'pistol') {
    return WEAPONS[weaponId] ?? WEAPONS.pistol;
}

export function getWeaponBySlot(slot) {
    return Object.values(WEAPONS).find((weapon) => weapon.slot === slot) ?? null;
}

export function getWeaponIds() {
    return WEAPON_ORDER.slice();
}
