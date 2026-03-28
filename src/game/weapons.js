/**
 * Shared weapon metadata for player combat and HUD.
 */

const WEAPONS = {
    knife: {
        id: 'knife',
        slot: 1,
        label: 'KNIFE',
        ammoCost: 0,
        cooldown: 0.3,
        muzzleFlash: 0.12,
        pellets: 1,
        spread: 0,
        range: 1.2,
        tolerance: 0.34,
        damageMin: 14,
        damageMax: 30,
        sound: 'slash-knife',
        screenFlash: false,
        viewWidth: 116,
        viewHeight: 124,
        recoil: 0,
    },
    pistol: {
        id: 'pistol',
        slot: 2,
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
        screenFlash: true,
        viewWidth: 124,
        viewHeight: 132,
        recoil: 6,
    },
    shotgun: {
        id: 'shotgun',
        slot: 3,
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
        screenFlash: true,
        viewWidth: 164,
        viewHeight: 164,
        recoil: 7,
    },
    machinegun: {
        id: 'machinegun',
        slot: 4,
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
        screenFlash: true,
        viewWidth: 152,
        viewHeight: 146,
        recoil: 5,
    },
    chaingun: {
        id: 'chaingun',
        slot: 5,
        label: 'CHAINGUN',
        ammoCost: 1,
        cooldown: 0.075,
        muzzleFlash: 0.095,
        pellets: 1,
        spread: 0.05,
        range: 9,
        tolerance: 0.25,
        damageMin: 11,
        damageMax: 19,
        sound: 'shot-chaingun',
        screenFlash: true,
        viewWidth: 160,
        viewHeight: 152,
        recoil: 4,
    },
};

export const WEAPON_ORDER = ['knife', 'pistol', 'shotgun', 'machinegun', 'chaingun'];

export function getWeapon(weaponId = 'pistol') {
    return WEAPONS[weaponId] ?? WEAPONS.pistol;
}

export function getWeaponBySlot(slot) {
    return Object.values(WEAPONS).find((weapon) => weapon.slot === slot) ?? null;
}

export function getWeaponIds() {
    return WEAPON_ORDER.slice();
}
