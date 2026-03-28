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
        const isShotgun = key.includes('shotgun');
        const isMachineGun = key.includes('machinegun');
        const isChainGun = key.includes('chaingun');
        const isFire = key.includes('_fire_');

        if (isKnife) {
            ctx.fillStyle = '#d0d4d9';
            ctx.beginPath();
            ctx.moveTo(32, 8);
            ctx.lineTo(40, 36);
            ctx.lineTo(32, 34);
            ctx.lineTo(24, 36);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#5b4028';
            ctx.fillRect(27, 35, 10, 18);
        } else if (isShotgun) {
            ctx.fillStyle = '#5f4b35';
            ctx.fillRect(10, 48, 18, 12);
            ctx.fillRect(36, 48, 18, 12);
            ctx.fillStyle = '#2a2018';
            ctx.fillRect(12, 36, 40, 16);
            ctx.fillStyle = '#53422e';
            ctx.fillRect(22, 24, 20, 14);
            ctx.fillStyle = '#9697a0';
            ctx.fillRect(26, 6, 12, 20);
        } else if (isChainGun) {
            ctx.fillStyle = '#63513c';
            ctx.fillRect(12, 46, 16, 12);
            ctx.fillRect(36, 46, 16, 12);
            ctx.fillStyle = '#353c45';
            ctx.fillRect(18, 24, 28, 24);
            ctx.fillRect(22, 10, 20, 16);
            ctx.fillStyle = '#b49a46';
            for (let index = 0; index < 4; index++) {
                ctx.fillRect(26 + index * 4, 18, 2, 16);
            }
        } else if (isMachineGun) {
            ctx.fillStyle = '#5d4732';
            ctx.fillRect(14, 46, 18, 12);
            ctx.fillRect(34, 46, 16, 12);
            ctx.fillStyle = '#2d3138';
            ctx.fillRect(18, 26, 28, 18);
            ctx.fillRect(24, 12, 16, 14);
            ctx.fillStyle = '#d2ba5c';
            ctx.fillRect(19, 30, 10, 4);
        } else {
            ctx.fillStyle = '#5d4732';
            ctx.fillRect(16, 46, 32, 12);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(18, 28, 28, 18);
            ctx.fillStyle = '#3c3c3c';
            ctx.fillRect(24, 18, 16, 12);
            ctx.fillStyle = '#7d7d85';
            ctx.fillRect(28, 6, 8, 14);
        }

        ctx.fillStyle = '#d8b291';
        if (isKnife) {
            ctx.fillRect(18, 50, 12, 10);
            ctx.fillRect(34, 50, 12, 10);
        } else {
            ctx.fillRect(6, 52, 14, 10);
            ctx.fillRect(44, 52, 14, 10);
        }

        if (isFire) {
            if (isKnife) {
                ctx.strokeStyle = '#f4efdc';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(16, 18);
                ctx.lineTo(48, 38);
                ctx.stroke();
            } else if (isChainGun) {
                this.drawMuzzleFlash(ctx, 25, 8, 7, '#fff6c0', '#f3c34b');
                this.drawMuzzleFlash(ctx, 39, 8, 7, '#fff6c0', '#f3c34b');
            } else {
                this.drawMuzzleFlash(ctx, 32, isShotgun ? 4 : 6, isShotgun ? 12 : 8, '#fff6c0', '#f3c34b');
            }
        }
    }
}
