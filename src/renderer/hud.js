/**
 * HUD — faithful recreation of the original Wolfenstein 3D status bar.
 * Status bar sits below the 3D viewport (bottom 80px of 640×400).
 * Weapon view is drawn in the viewport area, clipped above the bar.
 */

import { getWeapon, WEAPON_ORDER } from '../game/weapons.js';
import { spriteGenerator } from '../sprites/SpriteGenerator.js';

/* ─── Constants ──────────────────────────────────────────────── */

const STATUS_BAR_HEIGHT = 80;
const VIEWPORT_HEIGHT = 320;

/* ─── Helpers ────────────────────────────────────────────────── */

function drawSprite(ctx, key, x, y, width, height) {
    const sprite = spriteGenerator.paintSpriteCanvas(key);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, x, y, width, height);
    ctx.restore();
}

function getFaceSpriteKey(gameState) {
    if (gameState.damageFlash > 0) return 'ui_face_pain_0';
    if (gameState.health < 30) return 'ui_face_critical_0';
    if (gameState.health < 70) return 'ui_face_wounded_0';
    return 'ui_face_healthy_0';
}

function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/* ─── Status bar procedural background ───────────────────────── */

let statusBarBgCache = null;

function generateStatusBarBackground(width, height) {
    if (statusBarBgCache) return statusBarBgCache;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Gray stone texture — like original Wolf3D status bar
    ctx.fillStyle = '#505050';
    ctx.fillRect(0, 0, width, height);

    // Stone block pattern
    const blockH = 10;
    for (let row = 0; row < Math.ceil(height / blockH); row++) {
        const y = row * blockH;
        const offset = row % 2 === 0 ? 0 : 16;
        for (let x = offset - 16; x < width; x += 32) {
            const shade = 68 + Math.floor(Math.sin(x * 0.3 + row * 1.7) * 12);
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
            ctx.fillRect(x + 1, y + 1, 30, blockH - 2);
            // Highlight top/left
            ctx.fillStyle = `rgba(255,255,255,0.06)`;
            ctx.fillRect(x + 1, y + 1, 30, 1);
            ctx.fillRect(x + 1, y + 1, 1, blockH - 2);
            // Shadow bottom/right
            ctx.fillStyle = `rgba(0,0,0,0.12)`;
            ctx.fillRect(x + 1, y + blockH - 2, 30, 1);
            ctx.fillRect(x + 30, y + 1, 1, blockH - 2);
        }
    }

    // Surface noise
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const jitter = Math.round((Math.random() * 2 - 1) * 4);
        data[i] = Math.max(0, Math.min(255, data[i] + jitter));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + jitter));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + jitter));
    }
    ctx.putImageData(imageData, 0, 0);

    statusBarBgCache = canvas;
    return canvas;
}

/* ─── 3D beveled section drawing ─────────────────────────────── */

function drawBeveledSection(ctx, x, y, w, h) {
    // Dark inset background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, w, h);

    // Top-left highlight (raised outer bevel)
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y, 2, h);

    // Bottom-right shadow (raised outer bevel)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x + w - 2, y, 2, h);

    // Inner bevel
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 2, y + 2, w - 4, 1);
    ctx.fillRect(x + 2, y + 2, 1, h - 4);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + 2, y + h - 3, w - 4, 1);
    ctx.fillRect(x + w - 3, y + 2, 1, h - 4);
}

/* ─── Large pixel number renderer ────────────────────────────── */

// Simple 5×7 digit glyphs (each row is a bitmask)
const DIGIT_GLYPHS = [
    [0x1F, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1F], // 0
    [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E], // 1
    [0x1F, 0x01, 0x01, 0x1F, 0x10, 0x10, 0x1F], // 2
    [0x1F, 0x01, 0x01, 0x1F, 0x01, 0x01, 0x1F], // 3
    [0x11, 0x11, 0x11, 0x1F, 0x01, 0x01, 0x01], // 4
    [0x1F, 0x10, 0x10, 0x1F, 0x01, 0x01, 0x1F], // 5
    [0x1F, 0x10, 0x10, 0x1F, 0x11, 0x11, 0x1F], // 6
    [0x1F, 0x01, 0x01, 0x02, 0x04, 0x04, 0x04], // 7
    [0x1F, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x1F], // 8
    [0x1F, 0x11, 0x11, 0x1F, 0x01, 0x01, 0x1F], // 9
];

const PERCENT_GLYPH = [0x11, 0x02, 0x02, 0x04, 0x08, 0x08, 0x11]; // %

function drawPixelChar(ctx, glyph, x, y, scale, color) {
    ctx.fillStyle = color;
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
            if (glyph[row] & (0x10 >> col)) {
                ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
            }
        }
    }
}

function drawPixelNumber(ctx, value, x, y, scale, color, padDigits = 0) {
    const str = padDigits > 0 ? String(value).padStart(padDigits, '0') : String(value);
    const charWidth = 6 * scale;
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === '%') {
            drawPixelChar(ctx, PERCENT_GLYPH, x + i * charWidth, y, scale, color);
        } else {
            const digit = parseInt(ch, 10);
            if (!isNaN(digit)) {
                drawPixelChar(ctx, DIGIT_GLYPHS[digit], x + i * charWidth, y, scale, color);
            }
        }
    }
    return str.length * charWidth;
}

function drawPixelText(ctx, text, x, y, scale, color) {
    // Simple uppercase letter rendering for labels
    ctx.fillStyle = color;
    ctx.font = `bold ${scale * 7}px monospace`;
    ctx.fillText(text, x, y + scale * 6);
}

/* ─── Weapon view (first-person) ─────────────────────────────── */

function drawWeapon(ctx, canvasWidth, gameState) {
    const weapon = getWeapon(gameState.weapon);
    const previousWeapon = getWeapon(gameState.weaponSwitchFrom ?? gameState.weapon);
    const bob = Math.sin(gameState.levelTime * 6) * 2;
    const switchProgress = gameState.weaponSwitchTimer > 0
        ? (gameState.weaponSwitchTimer / gameState.weaponSwitchDuration)
        : 0;
    const activeWeapon = switchProgress > 0.5 ? previousWeapon : weapon;
    const activeRecoil = activeWeapon.id === weapon.id && gameState.muzzleFlash > 0
        ? -(weapon.recoil ?? 6)
        : 0;
    const width = activeWeapon.viewWidth ?? 124;
    const height = activeWeapon.viewHeight ?? 132;
    const slide = switchProgress > 0
        ? Math.sin((1 - switchProgress) * Math.PI) * 42
        : 0;
    const drawX = (canvasWidth - width) / 2;
    const drawY = VIEWPORT_HEIGHT - height + bob + activeRecoil + slide - 2;
    const key = `weapon_${activeWeapon.id}_${gameState.muzzleFlash > 0 && activeWeapon.id === weapon.id ? 'fire' : 'idle'}_0`;
    drawSprite(ctx, key, drawX, drawY, width, height);
}

/* ─── Crosshair ──────────────────────────────────────────────── */

function drawCrosshair(ctx, canvasWidth, gameState) {
    const canFire = gameState.canFire() && gameState.ammo >= getWeapon(gameState.weapon).ammoCost;
    const centerY = VIEWPORT_HEIGHT / 2;
    ctx.strokeStyle = canFire ? 'rgba(255,255,255,0.78)' : 'rgba(255,128,128,0.78)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 8, centerY);
    ctx.lineTo(canvasWidth / 2 + 8, centerY);
    ctx.moveTo(canvasWidth / 2, centerY - 8);
    ctx.lineTo(canvasWidth / 2, centerY + 8);
    ctx.stroke();
}

/* ─── Status bar (original Wolf3D layout) ────────────────────── */

function drawStatusBar(ctx, canvasWidth, canvasHeight, gameState) {
    const barTop = VIEWPORT_HEIGHT;
    const barH = STATUS_BAR_HEIGHT;

    // Draw stone textured background
    const bg = generateStatusBarBackground(canvasWidth, barH);
    ctx.drawImage(bg, 0, barTop);

    // Gold border at top
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(0, barTop, canvasWidth, 2);
    ctx.fillStyle = '#daa520';
    ctx.fillRect(0, barTop, canvasWidth, 1);

    // Layout sections (original Wolf3D order):
    // | FLOOR | SCORE | LIVES | [FACE] | HEALTH | AMMO | KEYS | WEAPON_ICON |

    const sectionY = barTop + 8;
    const sectionH = barH - 16;

    // Section 1: FLOOR
    drawBeveledSection(ctx, 8, sectionY, 72, sectionH);
    drawPixelText(ctx, 'FLOOR', 16, sectionY + 4, 1.3, '#aaaaaa');
    drawPixelNumber(ctx, gameState.currentLevelNumber, 24, sectionY + 22, 3, '#ffffff', 2);

    // Section 2: SCORE
    drawBeveledSection(ctx, 86, sectionY, 112, sectionH);
    drawPixelText(ctx, 'SCORE', 94, sectionY + 4, 1.3, '#aaaaaa');
    drawPixelNumber(ctx, gameState.score, 94, sectionY + 22, 3, '#ffffff', 7);

    // Section 3: LIVES
    drawBeveledSection(ctx, 204, sectionY, 58, sectionH);
    drawPixelText(ctx, 'LIVES', 212, sectionY + 4, 1.3, '#aaaaaa');
    drawPixelNumber(ctx, gameState.lives, 224, sectionY + 22, 3, '#ffffff');

    // Section 4: BJ Face (center)
    const faceSize = 56;
    const faceX = (canvasWidth - faceSize) / 2 - 4;
    drawBeveledSection(ctx, faceX - 6, sectionY, faceSize + 12, sectionH);
    drawSprite(ctx, getFaceSpriteKey(gameState), faceX, sectionY + 4, faceSize, faceSize);

    // Section 5: HEALTH
    const healthX = faceX + faceSize + 14;
    drawBeveledSection(ctx, healthX, sectionY, 80, sectionH);
    drawPixelText(ctx, 'HEALTH', healthX + 8, sectionY + 4, 1.3, '#aaaaaa');
    const healthStr = String(gameState.health);
    drawPixelNumber(ctx, gameState.health, healthX + 10, sectionY + 22, 3, '#ffffff');
    // % sign
    drawPixelChar(ctx, PERCENT_GLYPH, healthX + 10 + healthStr.length * 18, sectionY + 22, 3, '#ffffff');

    // Section 6: AMMO
    const ammoX = healthX + 86;
    drawBeveledSection(ctx, ammoX, sectionY, 62, sectionH);
    drawPixelText(ctx, 'AMMO', ammoX + 8, sectionY + 4, 1.3, '#aaaaaa');
    drawPixelNumber(ctx, gameState.ammo, ammoX + 12, sectionY + 22, 3, '#ffffff', 2);

    // Section 7: KEYS
    const keysX = ammoX + 68;
    drawBeveledSection(ctx, keysX, sectionY, 54, sectionH);
    drawPixelText(ctx, 'KEYS', keysX + 8, sectionY + 4, 1.3, '#aaaaaa');
    // Gold key
    if (gameState.keys.has('gold')) {
        drawSprite(ctx, 'ui_key_gold_0', keysX + 6, sectionY + 24, 20, 32);
    }
    // Silver key
    if (gameState.keys.has('silver')) {
        drawSprite(ctx, 'ui_key_silver_0', keysX + 28, sectionY + 24, 20, 32);
    }

    // Section 8: WEAPON icon
    const weaponX = keysX + 60;
    const weaponW = canvasWidth - weaponX - 8;
    drawBeveledSection(ctx, weaponX, sectionY, weaponW, sectionH);
    const weapon = getWeapon(gameState.weapon);
    drawPixelText(ctx, weapon.label, weaponX + 8, sectionY + 4, 1.3, '#aaaaaa');
    // Small weapon sprite
    const wKey = `weapon_${weapon.id}_idle_0`;
    drawSprite(ctx, wKey, weaponX + 8, sectionY + 14, weaponW - 16, sectionH - 22);
}

/* ─── Toast messages ─────────────────────────────────────────── */

function drawToast(ctx, canvasWidth, gameState) {
    if (!gameState.levelMessage) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fillRect(canvasWidth / 2 - 150, 30, 300, 36);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.strokeRect(canvasWidth / 2 - 150, 30, 300, 36);
    ctx.fillStyle = '#fff6ce';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.levelMessage, canvasWidth / 2, 53);
    ctx.textAlign = 'start';
}

/* ─── Overlay screens ────────────────────────────────────────── */

function drawCenteredPanel(ctx, canvasWidth, canvasHeight, width, height) {
    const left = (canvasWidth - width) / 2;
    const top = (canvasHeight - height) / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.76)';
    ctx.fillRect(left, top, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(left, top, width, height);
    return { left, top };
}

function drawTitleOverlay(ctx, canvasWidth, canvasHeight, gameState, level) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 430, 220);

    drawSprite(ctx, 'ui_badge_title_0', panel.left + 334, panel.top + 18, 72, 72);
    ctx.fillStyle = '#fff1c0';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('WOLF3D // E1', panel.left + 24, panel.top + 42);
    ctx.font = 'bold 18px monospace';
    ctx.fillText(level?.name ?? 'START MISSION', panel.left + 24, panel.top + 74);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#d7d2c6';
    ctx.fillText(level?.metadata?.briefing ?? 'Begin the campaign run.', panel.left + 24, panel.top + 102);
    ctx.fillText('WASD move  QE strafe  Space use  Ctrl/Enter fire', panel.left + 24, panel.top + 138);
    ctx.fillText('1/2/3/4/5 switch weapon  Esc pause  H help', panel.left + 24, panel.top + 160);
    ctx.fillStyle = '#fff1c0';
    ctx.fillText('Press Enter to start.', panel.left + 24, panel.top + 194);
}

function drawIntermissionOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    const summary = gameState.lastCompletedLevel;
    if (!summary) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 420, 228);

    ctx.fillStyle = '#fff1c0';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('FLOOR CLEAR', panel.left + 24, panel.top + 40);
    ctx.font = 'bold 16px monospace';
    ctx.fillText(summary.name, panel.left + 24, panel.top + 70);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#d7d2c6';
    ctx.fillText(`TIME     ${formatTime(summary.time)}`, panel.left + 24, panel.top + 102);
    ctx.fillText(`KILLS    ${summary.kills}/${summary.enemiesTotal}`, panel.left + 24, panel.top + 126);
    ctx.fillText(`PICKUPS  ${summary.pickups}/${summary.pickupsTotal}`, panel.left + 24, panel.top + 150);
    ctx.fillText(`HEALTH   ${summary.health}`, panel.left + 24, panel.top + 174);
    ctx.fillText(`ARMOR    ${summary.armor}`, panel.left + 24, panel.top + 198);
    ctx.fillText(`SCORE    ${summary.score}`, panel.left + 220, panel.top + 102);
    ctx.fillText(`NEXT     ${gameState.pendingLevelName}`, panel.left + 220, panel.top + 126);
    ctx.fillText(`SECRETS  ${summary.secrets}/${summary.secretsTotal}`, panel.left + 220, panel.top + 150);
    ctx.fillText(`TREASURE ${summary.treasures}/${summary.treasuresTotal}`, panel.left + 220, panel.top + 174);
    ctx.fillStyle = '#fff1c0';
    ctx.fillText('Press Enter to deploy to the next floor.', panel.left + 24, panel.top + 216);
}

function drawEndOverlay(ctx, canvasWidth, canvasHeight, title, subtitle) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 360, 140);
    ctx.fillStyle = '#fff6ce';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, panel.left + 180, panel.top + 52);
    ctx.font = '14px monospace';
    ctx.fillText(subtitle, panel.left + 180, panel.top + 88);
    ctx.textAlign = 'start';
}

function drawPauseOverlay(ctx, canvasWidth, canvasHeight, level) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 380, 136);
    ctx.fillStyle = '#fff6ce';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', panel.left + 190, panel.top + 42);
    ctx.font = '13px monospace';
    ctx.fillText(level?.metadata?.primaryObjective ?? 'Resume when ready.', panel.left + 190, panel.top + 74);
    ctx.fillText('Esc resume  H open help', panel.left + 190, panel.top + 100);
    ctx.textAlign = 'start';
}

function drawHelpOverlay(ctx, canvasWidth, canvasHeight, level) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 470, 236);
    ctx.fillStyle = '#fff6ce';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('FIELD MANUAL', panel.left + 20, panel.top + 36);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#d7d2c6';
    ctx.fillText(level?.metadata?.primaryObjective ?? 'Reach the next lift.', panel.left + 20, panel.top + 68);
    ctx.fillText(`Bonus: ${level?.metadata?.bonusObjective ?? 'Explore side paths.'}`, panel.left + 20, panel.top + 92);
    ctx.fillText('WASD move  QE strafe  Space use/interact', panel.left + 20, panel.top + 124);
    ctx.fillText('Ctrl/Enter/F fire  1/2/3/4/5 weapon switch', panel.left + 20, panel.top + 148);
    ctx.fillText('Armor absorbs part of incoming damage.', panel.left + 20, panel.top + 172);
    ctx.fillText('Secrets and treasure boost score.', panel.left + 20, panel.top + 196);
    ctx.fillText('H or Esc closes this overlay.', panel.left + 20, panel.top + 220);
}

/* ─── Main HUD draw ──────────────────────────────────────────── */

export function drawHUD(ctx, frame) {
    const { gameState, level } = frame;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const weapon = getWeapon(gameState.weapon);

    ctx.save();

    // Screen effects (full screen)
    if (gameState.screenFade > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, gameState.screenFade)})`;
        ctx.fillRect(0, 0, canvasWidth, VIEWPORT_HEIGHT);
    }
    if (gameState.damageFlash > 0) {
        ctx.fillStyle = `rgba(172, 18, 18, ${Math.min(0.35, gameState.damageFlash * 1.2)})`;
        ctx.fillRect(0, 0, canvasWidth, VIEWPORT_HEIGHT);
    }
    if (gameState.pickupFlash > 0) {
        ctx.fillStyle = `rgba(255, 240, 164, ${Math.min(0.22, gameState.pickupFlash)})`;
        ctx.fillRect(0, 0, canvasWidth, VIEWPORT_HEIGHT);
    }
    if (gameState.muzzleFlash > 0 && weapon.screenFlash !== false) {
        ctx.fillStyle = `rgba(255, 226, 164, ${Math.min(0.18, gameState.muzzleFlash * 1.4)})`;
        ctx.fillRect(0, 0, canvasWidth, VIEWPORT_HEIGHT);
    }

    // Crosshair in viewport
    drawCrosshair(ctx, canvasWidth, gameState);

    // Weapon view — clipped to viewport area (above status bar)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, VIEWPORT_HEIGHT);
    ctx.clip();
    drawWeapon(ctx, canvasWidth, gameState);
    ctx.restore();

    // Status bar — always on top
    drawStatusBar(ctx, canvasWidth, canvasHeight, gameState);

    // Toast message
    drawToast(ctx, canvasWidth, gameState);

    // Overlay screens
    if (gameState.levelStatus === 'title') {
        drawTitleOverlay(ctx, canvasWidth, canvasHeight, gameState, level);
    } else if (gameState.levelStatus === 'intermission') {
        drawIntermissionOverlay(ctx, canvasWidth, canvasHeight, gameState);
    } else if (gameState.levelStatus === 'dead') {
        drawEndOverlay(ctx, canvasWidth, canvasHeight, 'YOU DIED', 'Press Enter to restart the floor');
    } else if (gameState.levelStatus === 'victory') {
        drawEndOverlay(ctx, canvasWidth, canvasHeight, 'EPISODE CLEAR', 'Press Enter to restart the campaign');
    }

    if (gameState.paused) {
        drawPauseOverlay(ctx, canvasWidth, canvasHeight, level);
    }
    if (gameState.showHelp) {
        drawHelpOverlay(ctx, canvasWidth, canvasHeight, level);
    }

    ctx.restore();
}
