import { SpritePainter } from '../SpritePainter.js';

/**
 * First-person weapon views — more faithful to original Wolf3D silhouettes.
 */
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
        const isShotgun = key.includes('shotgun');
        const isMachineGun = key.includes('machinegun');
        const isChainGun = key.includes('chaingun');
        const isFire = key.includes('_fire_');

        if (isKnife) {
            this.paintKnife(ctx, width, height, isFire);
        } else if (isShotgun) {
            this.paintShotgun(ctx, width, height, isFire);
        } else if (isChainGun) {
            this.paintChaingun(ctx, width, height, isFire);
        } else if (isMachineGun) {
            this.paintMachinegun(ctx, width, height, isFire);
        } else {
            this.paintPistol(ctx, width, height, isFire);
        }
    }

    paintKnife(ctx, width, height, isFire) {
        // Straight blade — original Wolf3D knife is a dagger shape
        ctx.fillStyle = '#c0c8d0';
        ctx.beginPath();
        ctx.moveTo(30, 6);
        ctx.lineTo(34, 6);
        ctx.lineTo(36, 32);
        ctx.lineTo(32, 34);
        ctx.lineTo(28, 32);
        ctx.closePath();
        ctx.fill();
        // Blade edge highlight
        ctx.fillStyle = '#e0e4e8';
        ctx.beginPath();
        ctx.moveTo(31, 8);
        ctx.lineTo(33, 8);
        ctx.lineTo(34, 30);
        ctx.lineTo(32, 32);
        ctx.closePath();
        ctx.fill();
        // Guard
        ctx.fillStyle = '#8a7040';
        ctx.fillRect(26, 33, 12, 3);
        // Handle
        ctx.fillStyle = '#5b3820';
        ctx.fillRect(28, 36, 8, 16);
        ctx.fillStyle = '#7a4c2a';
        ctx.fillRect(29, 37, 6, 14);

        // Hands gripping
        ctx.fillStyle = '#d8b291';
        ctx.fillRect(20, 48, 12, 12);
        ctx.fillRect(32, 48, 12, 12);

        if (isFire) {
            // Slash motion blur
            ctx.strokeStyle = 'rgba(220,224,228,0.6)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(14, 16);
            ctx.lineTo(50, 40);
            ctx.stroke();
        }
    }

    paintPistol(ctx, width, height, isFire) {
        // Luger-style pistol — original Wolf3D
        // Barrel
        ctx.fillStyle = '#4a4a52';
        ctx.fillRect(27, 8, 10, 18);
        // Barrel highlight
        ctx.fillStyle = '#6a6a72';
        ctx.fillRect(28, 9, 2, 16);
        // Slide
        ctx.fillStyle = '#3a3a42';
        ctx.fillRect(25, 14, 14, 12);
        // Trigger guard
        ctx.fillStyle = '#3a3a42';
        ctx.fillRect(26, 26, 12, 3);
        ctx.fillRect(25, 28, 3, 6);
        // Trigger
        ctx.fillStyle = '#2a2a30';
        ctx.fillRect(30, 29, 2, 4);
        // Grip
        ctx.fillStyle = '#5d4732';
        ctx.fillRect(27, 29, 10, 16);
        ctx.fillStyle = '#7a5a3e';
        ctx.fillRect(28, 30, 8, 14);
        // Grip texture lines
        ctx.fillStyle = '#4a3828';
        for (let y = 32; y < 42; y += 3) {
            ctx.fillRect(29, y, 6, 1);
        }

        // Hands
        ctx.fillStyle = '#d8b291';
        ctx.fillRect(8, 50, 16, 12);
        ctx.fillRect(40, 50, 16, 12);

        if (isFire) {
            this.drawMuzzleFlash(ctx, 32, 6, 9, '#fff8d0', '#f0c848');
        }
    }

    paintShotgun(ctx, width, height, isFire) {
        // Double barrel
        ctx.fillStyle = '#5a5a62';
        ctx.fillRect(25, 4, 6, 22);
        ctx.fillRect(33, 4, 6, 22);
        // Barrel tips
        ctx.fillStyle = '#3a3a42';
        ctx.fillRect(25, 4, 6, 2);
        ctx.fillRect(33, 4, 6, 2);
        // Receiver
        ctx.fillStyle = '#2a2a32';
        ctx.fillRect(22, 24, 20, 12);
        // Foregrip
        ctx.fillStyle = '#5d4228';
        ctx.fillRect(24, 36, 16, 10);
        ctx.fillStyle = '#7a5630';
        ctx.fillRect(25, 37, 14, 8);
        // Stock
        ctx.fillStyle = '#4a3420';
        ctx.fillRect(26, 46, 12, 10);

        // Hands
        ctx.fillStyle = '#d8b291';
        ctx.fillRect(8, 50, 14, 12);
        ctx.fillRect(42, 50, 14, 12);

        if (isFire) {
            this.drawMuzzleFlash(ctx, 28, 2, 10, '#fff8d0', '#f0c848');
            this.drawMuzzleFlash(ctx, 36, 2, 10, '#fff8d0', '#f0c848');
        }
    }

    paintMachinegun(ctx, width, height, isFire) {
        // MP40-style submachine gun
        // Barrel
        ctx.fillStyle = '#4a4a52';
        ctx.fillRect(29, 8, 6, 16);
        // Body/receiver
        ctx.fillStyle = '#2d3138';
        ctx.fillRect(22, 24, 20, 14);
        // Magazine
        ctx.fillStyle = '#d2ba5c';
        ctx.fillRect(20, 30, 10, 6);
        // Stock
        ctx.fillStyle = '#5d4732';
        ctx.fillRect(26, 38, 12, 14);
        ctx.fillStyle = '#7a5a3e';
        ctx.fillRect(27, 39, 10, 12);
        // Foregrip
        ctx.fillStyle = '#3a3a42';
        ctx.fillRect(24, 22, 16, 4);

        // Hands
        ctx.fillStyle = '#d8b291';
        ctx.fillRect(10, 48, 16, 12);
        ctx.fillRect(38, 48, 16, 12);

        if (isFire) {
            this.drawMuzzleFlash(ctx, 32, 6, 8, '#fff8d0', '#f0c848');
        }
    }

    paintChaingun(ctx, width, height, isFire) {
        // Gatling-style chain gun
        // Multiple barrels
        ctx.fillStyle = '#4a4a52';
        ctx.fillRect(26, 6, 4, 18);
        ctx.fillRect(31, 6, 4, 18);
        ctx.fillRect(36, 8, 4, 16);
        ctx.fillRect(24, 10, 4, 14);
        // Barrel band
        ctx.fillStyle = '#3a3a42';
        ctx.fillRect(22, 18, 20, 4);
        // Body
        ctx.fillStyle = '#353c45';
        ctx.fillRect(20, 22, 24, 16);
        // Ammo belt
        ctx.fillStyle = '#b49a46';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(24 + i * 4, 18, 2, 22);
        }
        // Handle/grip
        ctx.fillStyle = '#63513c';
        ctx.fillRect(26, 38, 12, 14);

        // Hands
        ctx.fillStyle = '#d8b291';
        ctx.fillRect(8, 48, 16, 12);
        ctx.fillRect(40, 48, 16, 12);

        if (isFire) {
            this.drawMuzzleFlash(ctx, 28, 4, 7, '#fff8d0', '#f0c848');
            this.drawMuzzleFlash(ctx, 36, 4, 7, '#fff8d0', '#f0c848');
        }
    }
}
