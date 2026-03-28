import { SpritePainter } from '../SpritePainter.js';

function frame(key, label) {
    return { key, label };
}

export class DecorationPainter extends SpritePainter {
    getFrames() {
        return [
            frame('decor_barrel_0', 'Decor Barrel'),
            frame('decor_table_0', 'Decor Table'),
            frame('decor_lamp_0', 'Decor Lamp'),
            frame('decor_skeleton_0', 'Decor Skeleton'),
            frame('decor_plant_0', 'Decor Plant'),
            frame('decor_armor_0', 'Decor Armor'),
            frame('decor_blood_0', 'Decor Blood'),
            frame('decor_column_0', 'Decor Column'),
            frame('decor_pot_0', 'Decor Pot'),
        ];
    }

    paintFrame(ctx, width, height, key) {
        this.clear(ctx, width, height);
        this.drawShadowEllipse(ctx, 32, 54, 14, 4, 0.16);

        switch (key) {
            case 'decor_barrel_0':
                this.paintBarrel(ctx);
                break;
            case 'decor_table_0':
                this.paintTable(ctx);
                break;
            case 'decor_lamp_0':
                this.paintLamp(ctx);
                break;
            case 'decor_skeleton_0':
                this.paintSkeleton(ctx);
                break;
            case 'decor_plant_0':
                this.paintPlant(ctx);
                break;
            case 'decor_armor_0':
                this.paintArmor(ctx);
                break;
            case 'decor_blood_0':
                this.paintBlood(ctx);
                break;
            case 'decor_column_0':
                this.paintColumn(ctx);
                break;
            case 'decor_pot_0':
                this.paintPot(ctx);
                break;
            default:
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(20, 20, 24, 24);
                break;
        }
    }

    paintBarrel(ctx) {
        ctx.fillStyle = '#4e7f42';
        ctx.fillRect(20, 18, 24, 30);
        ctx.fillStyle = '#2d4b27';
        ctx.fillRect(20, 20, 24, 4);
        ctx.fillRect(20, 34, 24, 4);
        ctx.fillStyle = '#d7c947';
        ctx.beginPath();
        ctx.arc(32, 30, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5b5b10';
        ctx.fillRect(31, 24, 2, 12);
        ctx.fillRect(26, 29, 12, 2);
    }

    paintTable(ctx) {
        ctx.fillStyle = '#6e482d';
        ctx.fillRect(14, 26, 36, 8);
        ctx.fillRect(18, 34, 4, 12);
        ctx.fillRect(42, 34, 4, 12);
        ctx.fillStyle = '#efefef';
        ctx.beginPath();
        ctx.arc(24, 24, 5, 0, Math.PI * 2);
        ctx.arc(40, 24, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    paintLamp(ctx) {
        const glow = ctx.createRadialGradient(32, 20, 2, 32, 20, 14);
        glow.addColorStop(0, 'rgba(255, 246, 176, 1)');
        glow.addColorStop(1, 'rgba(255, 246, 176, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(14, 2, 36, 36);
        ctx.fillStyle = '#f2d86f';
        ctx.beginPath();
        ctx.arc(32, 18, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7d7f88';
        ctx.fillRect(29, 26, 6, 22);
        ctx.fillRect(24, 46, 16, 4);
    }

    paintSkeleton(ctx) {
        ctx.strokeStyle = '#dad8d0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(32, 18, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(32, 25);
        ctx.lineTo(32, 43);
        ctx.moveTo(23, 31);
        ctx.lineTo(41, 31);
        ctx.moveTo(32, 43);
        ctx.lineTo(24, 52);
        ctx.moveTo(32, 43);
        ctx.lineTo(40, 52);
        ctx.stroke();
    }

    paintPlant(ctx) {
        ctx.fillStyle = '#7a4a28';
        ctx.fillRect(22, 38, 20, 10);
        ctx.fillStyle = '#2f8243';
        for (const [x, y, w, h] of [[31, 14, 6, 24], [22, 18, 8, 16], [36, 17, 8, 16], [26, 10, 8, 12]]) {
            ctx.beginPath();
            ctx.ellipse(x, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    paintArmor(ctx) {
        ctx.fillStyle = '#96a1ab';
        ctx.fillRect(24, 16, 16, 26);
        ctx.fillRect(26, 42, 4, 10);
        ctx.fillRect(34, 42, 4, 10);
        ctx.fillRect(20, 24, 4, 14);
        ctx.fillRect(40, 24, 4, 14);
        ctx.fillStyle = '#d8dee4';
        ctx.fillRect(27, 20, 10, 4);
    }

    paintBlood(ctx) {
        ctx.fillStyle = '#8c1e22';
        ctx.beginPath();
        ctx.ellipse(32, 40, 15, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(24, 43, 6, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(39, 36, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    paintColumn(ctx) {
        ctx.fillStyle = '#a9a69a';
        ctx.fillRect(24, 12, 16, 40);
        ctx.fillStyle = '#d5d0c1';
        ctx.fillRect(22, 12, 20, 6);
        ctx.fillRect(22, 46, 20, 6);
        ctx.fillStyle = '#8a887e';
        ctx.fillRect(26, 18, 2, 28);
        ctx.fillRect(36, 18, 2, 28);
    }

    paintPot(ctx) {
        ctx.fillStyle = '#85532e';
        ctx.beginPath();
        ctx.ellipse(32, 38, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(22, 28, 20, 10);
        ctx.fillStyle = '#b87b4f';
        ctx.fillRect(24, 30, 16, 3);
    }
}
