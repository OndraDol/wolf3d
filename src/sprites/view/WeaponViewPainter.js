import { SpritePainter } from '../SpritePainter.js';

export class WeaponViewPainter extends SpritePainter {
    getFrames() {
        return [
            { key: 'weapon_knife_idle_0', label: 'Weapon Knife Idle' },
            { key: 'weapon_knife_fire_0', label: 'Weapon Knife Fire' },
            { key: 'weapon_pistol_idle_0', label: 'Weapon Pistol Idle' },
            { key: 'weapon_pistol_fire_0', label: 'Weapon Pistol Fire' },
            { key: 'weapon_shotgun_idle_0', label: 'Weapon Shotgun Idle' },
            { key: 'weapon_shotgun_fire_0', label: 'Weapon Shotgun Fire' },
            { key: 'weapon_machinegun_idle_0', label: 'Weapon Machine Gun Idle' },
            { key: 'weapon_machinegun_fire_0', label: 'Weapon Machine Gun Fire' },
            { key: 'weapon_chaingun_idle_0', label: 'Weapon Chain Gun Idle' },
            { key: 'weapon_chaingun_fire_0', label: 'Weapon Chain Gun Fire' },
        ];
    }

    paintFrame(ctx, width, height, key) {
        this.clear(ctx, width, height);
        const isKnife = key.includes('knife');
        const isPistol = !isKnife && !key.includes('shotgun') && !key.includes('machinegun') && !key.includes('chaingun');
        const isShotgun = key.includes('shotgun');
        const isMachineGun = key.includes('machinegun');
        const isChainGun = key.includes('chaingun');
        const isFire = key.includes('_fire_');

        const handColor = '#d8b291';
        const handShadow = '#c0986a';

        if (isKnife) {
            // Dagger blade — triangular with highlights
            ctx.fillStyle = '#c8ccd4';
            ctx.beginPath();
            ctx.moveTo(32, 4);
            ctx.lineTo(38, 30);
            ctx.lineTo(32, 28);
            ctx.lineTo(26, 30);
            ctx.closePath();
            ctx.fill();
            // Blade highlight
            ctx.fillStyle = '#e8ecf0';
            ctx.beginPath();
            ctx.moveTo(32, 5);
            ctx.lineTo(34, 26);
            ctx.lineTo(32, 25);
            ctx.closePath();
            ctx.fill();
            // Cross guard
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(24, 30, 16, 3);
            // Handle grip
            ctx.fillStyle = '#5b4028';
            ctx.fillRect(28, 33, 8, 14);
            // Grip wrap lines
            ctx.fillStyle = '#483018';
            for (let gy = 35; gy < 46; gy += 3) {
                ctx.fillRect(28, gy, 8, 1);
            }
            // Pommel
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(27, 47, 10, 3);

            // Hands holding knife
            ctx.fillStyle = handColor;
            ctx.fillRect(18, 48, 14, 12);
            ctx.fillRect(32, 48, 14, 12);
            ctx.fillStyle = handShadow;
            ctx.fillRect(18, 56, 14, 4);
            ctx.fillRect(32, 56, 14, 4);
        } else if (isPistol) {
            // Luger pistol shape
            // Barrel (longer, thinner)
            ctx.fillStyle = '#3c3c3c';
            ctx.fillRect(28, 6, 8, 18);
            // Barrel highlight
            ctx.fillStyle = '#5a5a5a';
            ctx.fillRect(29, 6, 2, 16);
            // Receiver body
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(24, 22, 16, 12);
            // Toggle lock (Luger characteristic)
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(26, 22, 12, 4);
            ctx.fillStyle = '#606060';
            ctx.fillRect(27, 22, 3, 3);
            // Trigger guard
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(22, 32, 4, 8);
            ctx.fillRect(22, 38, 14, 2);
            // Trigger
            ctx.fillStyle = '#505050';
            ctx.fillRect(28, 34, 2, 5);
            // Grip (angled like Luger)
            ctx.fillStyle = '#5d4732';
            ctx.fillRect(30, 34, 10, 14);
            // Grip texture lines
            ctx.fillStyle = '#4a3824';
            for (let gy = 36; gy < 47; gy += 2) {
                ctx.fillRect(31, gy, 8, 1);
            }
            // Front sight
            ctx.fillStyle = '#505050';
            ctx.fillRect(30, 4, 4, 3);

            // Hands
            ctx.fillStyle = handColor;
            ctx.fillRect(8, 50, 16, 12);
            ctx.fillRect(40, 50, 16, 12);
            ctx.fillStyle = handShadow;
            ctx.fillRect(8, 58, 16, 4);
            ctx.fillRect(40, 58, 16, 4);
        } else if (isShotgun) {
            // Double-barrel shotgun
            // Two barrels
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(24, 4, 7, 22);
            ctx.fillRect(33, 4, 7, 22);
            // Barrel highlight
            ctx.fillStyle = '#6a6a6a';
            ctx.fillRect(25, 4, 2, 20);
            ctx.fillRect(34, 4, 2, 20);
            // Barrel openings
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(25, 4, 5, 2);
            ctx.fillRect(34, 4, 5, 2);
            // Receiver
            ctx.fillStyle = '#5f4b35';
            ctx.fillRect(20, 24, 24, 10);
            // Stock / foregrip
            ctx.fillStyle = '#6b4226';
            ctx.fillRect(18, 34, 28, 12);
            // Wood grain
            ctx.fillStyle = '#583820';
            ctx.fillRect(20, 36, 24, 1);
            ctx.fillRect(20, 40, 24, 1);
            ctx.fillRect(20, 44, 24, 1);
            // Trigger guard
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(28, 44, 8, 2);

            // Hands
            ctx.fillStyle = handColor;
            ctx.fillRect(6, 48, 16, 14);
            ctx.fillRect(42, 48, 16, 14);
            ctx.fillStyle = handShadow;
            ctx.fillRect(6, 58, 16, 4);
            ctx.fillRect(42, 58, 16, 4);
        } else if (isMachineGun) {
            // MP40-style machine gun
            // Barrel
            ctx.fillStyle = '#3c3c3c';
            ctx.fillRect(28, 8, 8, 14);
            ctx.fillStyle = '#585858';
            ctx.fillRect(29, 8, 2, 12);
            // Barrel shroud
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(24, 10, 16, 4);
            // Receiver
            ctx.fillStyle = '#2d3138';
            ctx.fillRect(20, 22, 24, 12);
            // Magazine
            ctx.fillStyle = '#d2ba5c';
            ctx.fillRect(18, 30, 10, 6);
            // Grip
            ctx.fillStyle = '#5d4732';
            ctx.fillRect(32, 34, 12, 12);
            ctx.fillStyle = '#4a3824';
            for (let gy = 36; gy < 45; gy += 2) {
                ctx.fillRect(33, gy, 10, 1);
            }
            // Folding stock
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(38, 22, 4, 14);

            // Hands
            ctx.fillStyle = handColor;
            ctx.fillRect(6, 50, 16, 12);
            ctx.fillRect(42, 50, 16, 12);
            ctx.fillStyle = handShadow;
            ctx.fillRect(6, 58, 16, 4);
            ctx.fillRect(42, 58, 16, 4);
        } else if (isChainGun) {
            // Chain gun with multiple barrels
            // Four barrel tubes
            ctx.fillStyle = '#4a4a4a';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(22 + i * 6, 6, 4, 18);
            }
            // Barrel highlights
            ctx.fillStyle = '#6a6a6a';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(23 + i * 6, 6, 1, 16);
            }
            // Housing
            ctx.fillStyle = '#353c45';
            ctx.fillRect(18, 24, 28, 16);
            // Housing detail
            ctx.fillStyle = '#454c55';
            ctx.fillRect(20, 26, 24, 2);
            // Ammo belt
            ctx.fillStyle = '#b49a46';
            for (let index = 0; index < 5; index++) {
                ctx.fillRect(20 + index * 5, 36, 3, 8);
            }
            // Grip
            ctx.fillStyle = '#63513c';
            ctx.fillRect(12, 40, 16, 14);
            ctx.fillRect(36, 40, 16, 14);

            // Hands
            ctx.fillStyle = handColor;
            ctx.fillRect(4, 50, 14, 12);
            ctx.fillRect(46, 50, 14, 12);
            ctx.fillStyle = handShadow;
            ctx.fillRect(4, 58, 14, 4);
            ctx.fillRect(46, 58, 14, 4);
        }

        // Muzzle flash / attack animation
        if (isFire) {
            if (isKnife) {
                // Knife slash arc
                ctx.strokeStyle = '#f4efdc';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(14, 14);
                ctx.quadraticCurveTo(32, 8, 50, 14);
                ctx.stroke();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(16, 16);
                ctx.quadraticCurveTo(32, 10, 48, 16);
                ctx.stroke();
            } else if (isChainGun) {
                this.drawMuzzleFlash(ctx, 25, 4, 7, '#fff6c0', '#f3c34b');
                this.drawMuzzleFlash(ctx, 39, 4, 7, '#fff6c0', '#f3c34b');
            } else if (isShotgun) {
                this.drawMuzzleFlash(ctx, 27, 2, 10, '#fff6c0', '#f3c34b');
                this.drawMuzzleFlash(ctx, 37, 2, 10, '#fff6c0', '#f3c34b');
            } else {
                this.drawMuzzleFlash(ctx, 32, 4, 9, '#fff6c0', '#f3c34b');
            }
        }
    }
}
