import { SpritePainter } from '../SpritePainter.js';

function createFrame(key, label) {
    return { key, label };
}

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
            this.paintFace(ctx, key);
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

    paintFace(ctx, key) {
        const mood = key.replace('ui_face_', '').replace('_0', '');

        // Skin colors per mood
        const skin = mood === 'pain'
            ? '#efc5c5'
            : (mood === 'critical' ? '#b47a63' : (mood === 'wounded' ? '#c69168' : '#d9a57b'));
        const skinDark = mood === 'pain'
            ? '#d0a0a0'
            : (mood === 'critical' ? '#8a5a43' : (mood === 'wounded' ? '#a07048' : '#b0854b'));
        const uniform = '#324760';
        const uniformDark = '#1a2c42';

        // Background — dark border
        ctx.fillStyle = '#1a2330';
        ctx.fillRect(10, 8, 44, 52);

        // Blue uniform collar at bottom
        ctx.fillStyle = uniformDark;
        ctx.fillRect(16, 46, 32, 14);
        ctx.fillStyle = uniform;
        ctx.fillRect(18, 46, 28, 12);
        // Collar V-shape
        ctx.fillStyle = skinDark;
        ctx.beginPath();
        ctx.moveTo(28, 46);
        ctx.lineTo(32, 52);
        ctx.lineTo(36, 46);
        ctx.closePath();
        ctx.fill();

        // Face oval (head shape)
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(32, 30, 13, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flat-top haircut — BJ's signature look
        ctx.fillStyle = '#6B4422';
        // Flat top block of hair
        ctx.fillRect(19, 12, 26, 8);
        // Side hair
        ctx.fillRect(18, 14, 4, 12);
        ctx.fillRect(42, 14, 4, 12);
        // Hair highlight
        ctx.fillStyle = '#8B6442';
        ctx.fillRect(21, 12, 22, 3);

        // Forehead shadow under hair
        ctx.fillStyle = skinDark;
        ctx.fillRect(22, 19, 20, 2);

        // Eyes — with whites and pupils
        // Eye whites
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(23, 26, 6, 4);
        ctx.fillRect(35, 26, 6, 4);
        // Irises (blue)
        ctx.fillStyle = '#4070B0';
        ctx.fillRect(25, 26, 3, 4);
        ctx.fillRect(37, 26, 3, 4);
        // Pupils
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(26, 27, 2, 2);
        ctx.fillRect(38, 27, 2, 2);

        // Eyebrows
        const browTilt = mood === 'healthy' ? 0 : (mood === 'wounded' ? 1 : 2);
        ctx.fillStyle = '#4a2e16';
        ctx.fillRect(22, 23 - browTilt, 8, 2);
        ctx.fillRect(34, 23 - browTilt, 8, 2);

        // Nose
        ctx.fillStyle = skinDark;
        ctx.fillRect(30, 31, 4, 5);
        ctx.fillStyle = skin;
        ctx.fillRect(31, 31, 2, 4);

        // Mouth — changes with health state
        if (mood === 'healthy') {
            // Slight grin
            ctx.fillStyle = '#8B3030';
            ctx.fillRect(27, 39, 10, 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(28, 39, 8, 1);
        } else if (mood === 'wounded') {
            // Neutral/tense
            ctx.fillStyle = '#7a2828';
            ctx.fillRect(26, 40, 12, 2);
        } else if (mood === 'critical') {
            // Open mouth (pain/grimace)
            ctx.fillStyle = '#5a1818';
            ctx.fillRect(25, 40, 14, 4);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(27, 40, 10, 1);
            // Blood
            ctx.fillStyle = '#8B1010';
            ctx.fillRect(40, 35, 3, 3);
        } else {
            // Pain — mouth open, teeth showing
            ctx.fillStyle = '#5a1818';
            ctx.fillRect(24, 39, 16, 5);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(26, 39, 12, 2);
            // Pain border flash
            ctx.fillStyle = '#ff4444';
            ctx.globalAlpha = 0.3;
            ctx.fillRect(10, 8, 44, 2);
            ctx.fillRect(10, 8, 2, 52);
            ctx.fillRect(52, 8, 2, 52);
            ctx.globalAlpha = 1.0;
        }

        // Ear hints
        ctx.fillStyle = skinDark;
        ctx.fillRect(18, 26, 3, 6);
        ctx.fillRect(43, 26, 3, 6);
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
