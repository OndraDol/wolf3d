import { SpritePainter } from '../SpritePainter.js';

function createFrame(key, label) {
    return { key, label };
}

/**
 * UI sprite painter — BJ face, keys, stat icons, title badge.
 * Face is more detailed and faithful to original Wolf3D.
 */
export class UIPainter extends SpritePainter {
    getFrames() {
        return [
            createFrame('ui_face_healthy_0', 'UI Face Healthy'),
            createFrame('ui_face_wounded_0', 'UI Face Wounded'),
            createFrame('ui_face_critical_0', 'UI Face Critical'),
            createFrame('ui_face_pain_0', 'UI Face Pain'),
            createFrame('ui_key_gold_0', 'UI Gold Key'),
            createFrame('ui_key_silver_0', 'UI Silver Key'),
            createFrame('ui_stat_health_0', 'UI Health'),
            createFrame('ui_stat_armor_0', 'UI Armor'),
            createFrame('ui_stat_ammo_0', 'UI Ammo'),
            createFrame('ui_stat_kill_0', 'UI Kills'),
            createFrame('ui_stat_pickup_0', 'UI Pickups'),
            createFrame('ui_stat_secret_0', 'UI Secrets'),
            createFrame('ui_stat_treasure_0', 'UI Treasure'),
            createFrame('ui_badge_title_0', 'UI Title Badge'),
        ];
    }

    paintFrame(ctx, width, height, key) {
        this.clear(ctx, width, height);

        if (key.startsWith('ui_face_')) {
            this.paintFace(ctx, width, height, key);
            return;
        }
        if (key.startsWith('ui_key_')) {
            this.paintKeyIcon(ctx, key);
            return;
        }
        if (key.startsWith('ui_stat_')) {
            this.paintStatIcon(ctx, key);
            return;
        }
        if (key === 'ui_badge_title_0') {
            this.paintTitleBadge(ctx, width, height);
            return;
        }
    }

    paintFace(ctx, width, height, key) {
        const mood = key.replace('ui_face_', '').replace('_0', '');

        // Skin tones matching original Wolf3D BJ
        const skin = mood === 'pain' ? '#e8b0b0'
            : mood === 'critical' ? '#b87a60' : mood === 'wounded' ? '#c8946a' : '#d8a878';
        const skinDark = mood === 'pain' ? '#c89090'
            : mood === 'critical' ? '#986048' : mood === 'wounded' ? '#a87850' : '#b88858';
        const hairColor = '#5a3818';
        const eyeWhite = mood === 'pain' ? '#ffffff' : '#e8e0d8';
        const eyeColor = '#2a4a28';

        const cx = width / 2;
        const cy = height / 2 - 2;

        // Background (dark)
        ctx.fillStyle = '#181818';
        ctx.fillRect(0, 0, width, height);

        // Neck / uniform collar
        ctx.fillStyle = '#2a4060';
        ctx.fillRect(cx - 12, cy + 14, 24, 20);
        ctx.fillStyle = '#344a6a';
        ctx.fillRect(cx - 10, cy + 14, 20, 2);

        // Head shape — oval
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Jaw shadow
        ctx.fillStyle = skinDark;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, 12, 10, 0, 0, Math.PI);
        ctx.fill();
        // Re-fill skin on top half
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 13, 14, 0, 0, Math.PI, true);
        ctx.fill();

        // Hair (flat-top style like BJ)
        ctx.fillStyle = hairColor;
        ctx.fillRect(cx - 13, cy - 18, 26, 8);
        ctx.fillRect(cx - 12, cy - 16, 2, 6);
        ctx.fillRect(cx + 10, cy - 16, 2, 6);

        // Ears
        ctx.fillStyle = skinDark;
        ctx.fillRect(cx - 15, cy - 4, 3, 8);
        ctx.fillRect(cx + 12, cy - 4, 3, 8);

        // Eyes
        const eyeY = cy - 4;
        const leftEyeX = cx - 6;
        const rightEyeX = cx + 2;

        // Eye whites
        ctx.fillStyle = eyeWhite;
        ctx.fillRect(leftEyeX, eyeY, 5, 4);
        ctx.fillRect(rightEyeX, eyeY, 5, 4);

        // Iris/pupil
        ctx.fillStyle = eyeColor;
        ctx.fillRect(leftEyeX + 1, eyeY + 1, 3, 2);
        ctx.fillRect(rightEyeX + 1, eyeY + 1, 3, 2);
        ctx.fillStyle = '#101010';
        ctx.fillRect(leftEyeX + 2, eyeY + 1, 1, 2);
        ctx.fillRect(rightEyeX + 2, eyeY + 1, 1, 2);

        // Eyebrows
        const browTilt = mood === 'healthy' ? 0 : mood === 'wounded' ? 1 : 2;
        ctx.fillStyle = '#3a2610';
        ctx.fillRect(leftEyeX - 1, eyeY - 3 + browTilt, 7, 2);
        ctx.fillRect(rightEyeX - 1, eyeY - 3 + browTilt, 7, 2);

        // Nose
        ctx.fillStyle = skinDark;
        ctx.fillRect(cx - 1, cy + 1, 3, 5);
        ctx.fillStyle = skin;
        ctx.fillRect(cx - 1, cy + 1, 2, 4);

        // Mouth
        const mouthY = cy + 9;
        if (mood === 'critical') {
            // Open mouth / grimace
            ctx.fillStyle = '#401010';
            ctx.fillRect(cx - 5, mouthY, 10, 4);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(cx - 4, mouthY, 8, 1);
        } else if (mood === 'pain') {
            // Wide open pain mouth
            ctx.fillStyle = '#501818';
            ctx.fillRect(cx - 6, mouthY - 1, 12, 5);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(cx - 5, mouthY - 1, 10, 1);
        } else if (mood === 'wounded') {
            // Tense mouth
            ctx.fillStyle = '#6a3a2a';
            ctx.fillRect(cx - 5, mouthY, 10, 2);
        } else {
            // Healthy — slight grin
            ctx.fillStyle = '#8a5a3a';
            ctx.fillRect(cx - 4, mouthY, 8, 2);
            ctx.fillStyle = '#e0d0c0';
            ctx.fillRect(cx - 3, mouthY, 6, 1);
        }

        // Blood splatter for critical
        if (mood === 'critical') {
            ctx.fillStyle = '#8a1818';
            ctx.fillRect(cx + 8, cy + 2, 3, 3);
            ctx.fillRect(cx + 7, cy + 5, 2, 4);
        }

        // Pain flash effect
        if (mood === 'pain') {
            ctx.fillStyle = 'rgba(255, 200, 200, 0.2)';
            ctx.fillRect(0, 0, width, height);
        }
    }

    paintKeyIcon(ctx, key) {
        const gold = key.includes('gold');
        const base = gold ? '#ddb449' : '#c9d3de';
        const shadow = gold ? '#8f6d18' : '#707a84';

        this.drawShadowEllipse(ctx, 32, 54, 12, 3, 0.14);
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(22, 32, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(26, 30, 20, 4);
        ctx.fillRect(40, 24, 4, 16);
        ctx.fillRect(34, 34, 4, 6);
        ctx.fillRect(30, 34, 3, 4);
        ctx.fillStyle = shadow;
        ctx.beginPath();
        ctx.arc(22, 32, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    paintStatIcon(ctx, key) {
        this.drawShadowEllipse(ctx, 32, 54, 10, 3, 0.14);
        ctx.fillStyle = '#10161d';
        ctx.fillRect(16, 16, 32, 32);

        switch (key) {
            case 'ui_stat_health_0':
                ctx.fillStyle = '#d34545';
                ctx.fillRect(28, 20, 8, 24);
                ctx.fillRect(20, 28, 24, 8);
                break;
            case 'ui_stat_armor_0':
                ctx.fillStyle = '#5a8fdf';
                ctx.beginPath();
                ctx.moveTo(32, 18);
                ctx.lineTo(44, 22);
                ctx.lineTo(42, 37);
                ctx.lineTo(32, 44);
                ctx.lineTo(22, 37);
                ctx.lineTo(20, 22);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#b9d5ff';
                ctx.fillRect(26, 25, 12, 7);
                break;
            case 'ui_stat_ammo_0':
                ctx.fillStyle = '#d7b24f';
                ctx.fillRect(22, 21, 6, 18);
                ctx.fillRect(30, 19, 6, 20);
                ctx.fillRect(38, 21, 6, 18);
                ctx.fillStyle = '#806a2d';
                ctx.fillRect(22, 36, 22, 4);
                break;
            case 'ui_stat_kill_0':
                ctx.fillStyle = '#d7d7d7';
                ctx.fillRect(24, 20, 4, 20);
                ctx.fillRect(36, 20, 4, 20);
                ctx.fillRect(26, 18, 12, 4);
                ctx.fillRect(26, 38, 12, 4);
                break;
            case 'ui_stat_pickup_0':
                ctx.fillStyle = '#f3f0ea';
                ctx.fillRect(20, 20, 24, 18);
                ctx.fillStyle = '#cb3838';
                ctx.fillRect(29, 22, 6, 14);
                ctx.fillRect(24, 27, 16, 4);
                break;
            case 'ui_stat_secret_0':
                ctx.fillStyle = '#f0d36a';
                ctx.beginPath();
                ctx.moveTo(32, 18);
                ctx.lineTo(36, 28);
                ctx.lineTo(46, 29);
                ctx.lineTo(38, 35);
                ctx.lineTo(41, 45);
                ctx.lineTo(32, 39);
                ctx.lineTo(23, 45);
                ctx.lineTo(26, 35);
                ctx.lineTo(18, 29);
                ctx.lineTo(28, 28);
                ctx.closePath();
                ctx.fill();
                break;
            case 'ui_stat_treasure_0':
                ctx.fillStyle = '#d6b04c';
                ctx.fillRect(26, 18, 12, 18);
                ctx.fillRect(21, 24, 22, 6);
                ctx.fillRect(24, 36, 16, 4);
                break;
            default:
                break;
        }
    }

    paintTitleBadge(ctx, width, height) {
        const gradient = ctx.createLinearGradient(14, 10, width - 14, height - 14);
        gradient.addColorStop(0, '#7d1919');
        gradient.addColorStop(1, '#301010');
        ctx.fillStyle = gradient;
        ctx.fillRect(10, 10, width - 20, height - 20);

        ctx.strokeStyle = '#d7b24f';
        ctx.lineWidth = 3;
        ctx.strokeRect(12, 12, width - 24, height - 24);
        ctx.strokeRect(18, 18, width - 36, height - 36);

        ctx.fillStyle = '#f6efcf';
        ctx.beginPath();
        ctx.arc(32, 29, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4d0f0f';
        ctx.fillRect(28, 22, 8, 15);
        ctx.fillRect(22, 27, 20, 5);

        ctx.fillStyle = '#d7b24f';
        ctx.fillRect(18, 45, 28, 3);
        ctx.fillRect(21, 49, 22, 2);
    }
}
