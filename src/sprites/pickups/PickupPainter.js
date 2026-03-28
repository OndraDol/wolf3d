import { SpritePainter } from '../SpritePainter.js';

export class PickupPainter extends SpritePainter {
    getFrames() {
        return [
            { key: 'pickup_medkit_0', label: 'Pickup Medkit' },
            { key: 'pickup_ammo_0', label: 'Pickup Ammo' },
            { key: 'pickup_armor_0', label: 'Pickup Armor' },
            { key: 'pickup_food_0', label: 'Pickup Food' },
            { key: 'pickup_gold_key_0', label: 'Pickup Gold Key' },
            { key: 'pickup_silver_key_0', label: 'Pickup Silver Key' },
            { key: 'pickup_knife_0', label: 'Pickup Knife' },
            { key: 'pickup_pistol_0', label: 'Pickup Pistol' },
            { key: 'pickup_shotgun_0', label: 'Pickup Shotgun' },
            { key: 'pickup_machinegun_0', label: 'Pickup Machine Gun' },
            { key: 'pickup_chaingun_0', label: 'Pickup Chain Gun' },
            { key: 'pickup_treasure_cross_0', label: 'Pickup Treasure Cross' },
            { key: 'pickup_treasure_chalice_0', label: 'Pickup Treasure Chalice' },
            { key: 'pickup_treasure_chest_0', label: 'Pickup Treasure Chest' },
            { key: 'pickup_treasure_crown_0', label: 'Pickup Treasure Crown' },
        ];
    }

    paintFrame(ctx, width, height, key) {
        this.clear(ctx, width, height);
        this.drawShadowEllipse(ctx, 32, 54, 12, 3, 0.16);

        switch (key) {
            case 'pickup_medkit_0':
                ctx.fillStyle = '#f1f1f1';
                ctx.fillRect(20, 18, 24, 18);
                ctx.fillStyle = '#c62d2d';
                ctx.fillRect(29, 21, 6, 12);
                ctx.fillRect(24, 26, 16, 4);
                break;
            case 'pickup_ammo_0':
                ctx.fillStyle = '#6a4c2a';
                ctx.fillRect(20, 24, 24, 14);
                ctx.fillStyle = '#d9b84c';
                for (let index = 0; index < 4; index++) {
                    ctx.fillRect(22 + index * 5, 18, 3, 8);
                }
                break;
            case 'pickup_armor_0':
                ctx.fillStyle = '#4b87d9';
                ctx.fillRect(20, 18, 24, 24);
                ctx.fillStyle = '#b8d4ff';
                ctx.fillRect(24, 22, 16, 12);
                ctx.fillStyle = '#335a92';
                ctx.fillRect(24, 34, 16, 4);
                break;
            case 'pickup_food_0':
                ctx.fillStyle = '#8c5b30';
                ctx.beginPath();
                ctx.ellipse(34, 28, 10, 8, 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f1d8c2';
                ctx.fillRect(19, 27, 10, 4);
                ctx.fillRect(16, 26, 4, 6);
                break;
            case 'pickup_gold_key_0':
                ctx.fillStyle = '#e0ba48';
                ctx.fillRect(20, 28, 20, 4);
                ctx.fillRect(35, 22, 4, 18);
                ctx.beginPath();
                ctx.arc(18, 30, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#9a7e24';
                ctx.beginPath();
                ctx.arc(18, 30, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'pickup_silver_key_0':
                ctx.fillStyle = '#cad2da';
                ctx.fillRect(20, 28, 20, 4);
                ctx.fillRect(35, 22, 4, 18);
                ctx.beginPath();
                ctx.arc(18, 30, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#808890';
                ctx.beginPath();
                ctx.arc(18, 30, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'pickup_knife_0':
                ctx.fillStyle = '#c8cdd2';
                ctx.beginPath();
                ctx.moveTo(32, 18);
                ctx.lineTo(38, 38);
                ctx.lineTo(32, 36);
                ctx.lineTo(26, 38);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#604229';
                ctx.fillRect(28, 37, 8, 12);
                break;
            case 'pickup_pistol_0':
                ctx.fillStyle = '#2a2e34';
                ctx.fillRect(20, 28, 20, 6);
                ctx.fillRect(22, 34, 6, 10);
                ctx.fillStyle = '#666a71';
                ctx.fillRect(28, 24, 10, 4);
                break;
            case 'pickup_shotgun_0':
                ctx.fillStyle = '#705844';
                ctx.fillRect(16, 30, 28, 4);
                ctx.fillRect(18, 33, 6, 10);
                ctx.fillStyle = '#4a4e54';
                ctx.fillRect(30, 26, 12, 5);
                break;
            case 'pickup_machinegun_0':
                ctx.fillStyle = '#30353b';
                ctx.fillRect(16, 28, 28, 6);
                ctx.fillRect(20, 34, 6, 10);
                ctx.fillStyle = '#d5ba52';
                ctx.fillRect(18, 30, 10, 3);
                ctx.fillRect(30, 24, 12, 4);
                break;
            case 'pickup_chaingun_0':
                ctx.fillStyle = '#323840';
                ctx.fillRect(16, 26, 28, 8);
                ctx.fillRect(20, 34, 8, 10);
                ctx.fillStyle = '#cfb04c';
                for (let index = 0; index < 3; index++) {
                    ctx.fillRect(26 + index * 4, 22, 2, 12);
                }
                break;
            case 'pickup_treasure_cross_0':
                ctx.fillStyle = '#d5b04a';
                ctx.fillRect(28, 18, 8, 22);
                ctx.fillRect(22, 24, 20, 8);
                break;
            case 'pickup_treasure_chalice_0':
                ctx.fillStyle = '#d3b24d';
                ctx.fillRect(27, 18, 10, 18);
                ctx.fillRect(22, 23, 20, 6);
                ctx.fillRect(24, 36, 16, 3);
                break;
            case 'pickup_treasure_chest_0':
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(20, 24, 24, 14);
                ctx.fillStyle = '#d8b24c';
                ctx.fillRect(20, 24, 24, 5);
                ctx.fillRect(30, 29, 4, 9);
                break;
            case 'pickup_treasure_crown_0':
                ctx.fillStyle = '#d6b04a';
                ctx.fillRect(22, 30, 20, 8);
                ctx.beginPath();
                ctx.moveTo(22, 30);
                ctx.lineTo(26, 20);
                ctx.lineTo(32, 28);
                ctx.lineTo(38, 20);
                ctx.lineTo(42, 30);
                ctx.closePath();
                ctx.fill();
                break;
            default:
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(20, 20, 24, 24);
                break;
        }
    }
}
