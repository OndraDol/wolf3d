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

    // Original Wolf3D status bar: blue-gray / teal solid color
    // The original used palette color ~(0,56,56) which is a dark teal-gray
    ctx.fillStyle = '#29444a';
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal banding for texture feel
    for (let y = 0; y < height; y += 2) {
        const shade = y % 4 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
        ctx.fillStyle = shade;
        ctx.fillRect(0, y, width, 1);
    }

    // Light surface noise
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const jitter = Math.round((Math.random() * 2 - 1) * 3);
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
    // Dark inset background (darker teal)
    ctx.fillStyle = '#0e1e22';
    ctx.fillRect(x, y, w, h);

    // Top-left highlight (raised outer bevel — lighter teal)
    ctx.fillStyle = '#4a6a72';
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y, 2, h);

    // Bottom-right shadow
    ctx.fillStyle = '#0a1416';
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x + w - 2, y, 2, h);

    // Inner subtle bevel
    ctx.fillStyle = '#1a2e32';
    ctx.fillRect(x + 2, y + 2, w - 4, 1);
    ctx.fillRect(x + 2, y + 2, 1, h - 4);
    ctx.fillStyle = '#142428';
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

    // Top border — lighter teal highlight, then dark line (original Wolf3D style)
    ctx.fillStyle = '#4a6a72';
    ctx.fillRect(0, barTop, canvasWidth, 2);
    ctx.fillStyle = '#5a8088';
    ctx.fillRect(0, barTop, canvasWidth, 1);

    // Layout sections (original Wolf3D order):
    // | FLOOR | SCORE | LIVES | [FACE] | HEALTH | AMMO | KEYS | WEAPON_ICON |

    const sectionY = barTop + 8;
    const sectionH = barH - 16;

    // Section 1: FLOOR
    drawBeveledSection(ctx, 8, sectionY, 72, sectionH);
    drawPixelText(ctx, 'FLOOR', 16, sectionY + 4, 1.3, '#7ab0b8');
    drawPixelNumber(ctx, gameState.currentLevelNumber, 24, sectionY + 22, 3, '#ffffff', 2);

    // Section 2: SCORE
    drawBeveledSection(ctx, 86, sectionY, 112, sectionH);
    drawPixelText(ctx, 'SCORE', 94, sectionY + 4, 1.3, '#7ab0b8');
    drawPixelNumber(ctx, gameState.score, 94, sectionY + 22, 3, '#ffffff', 7);

    // Section 3: LIVES
    drawBeveledSection(ctx, 204, sectionY, 58, sectionH);
    drawPixelText(ctx, 'LIVES', 212, sectionY + 4, 1.3, '#7ab0b8');
    drawPixelNumber(ctx, gameState.lives, 224, sectionY + 22, 3, '#ffffff');

    // Section 4: BJ Face (center)
    const faceSize = 56;
    const faceX = (canvasWidth - faceSize) / 2 - 4;
    drawBeveledSection(ctx, faceX - 6, sectionY, faceSize + 12, sectionH);
    drawSprite(ctx, getFaceSpriteKey(gameState), faceX, sectionY + 4, faceSize, faceSize);

    // Section 5: HEALTH
    const healthX = faceX + faceSize + 14;
    drawBeveledSection(ctx, healthX, sectionY, 80, sectionH);
    drawPixelText(ctx, 'HEALTH', healthX + 8, sectionY + 4, 1.3, '#7ab0b8');
    const healthStr = String(gameState.health);
    drawPixelNumber(ctx, gameState.health, healthX + 10, sectionY + 22, 3, '#ffffff');
    // % sign
    drawPixelChar(ctx, PERCENT_GLYPH, healthX + 10 + healthStr.length * 18, sectionY + 22, 3, '#ffffff');

    // Section 6: AMMO
    const ammoX = healthX + 86;
    drawBeveledSection(ctx, ammoX, sectionY, 62, sectionH);
    drawPixelText(ctx, 'AMMO', ammoX + 8, sectionY + 4, 1.3, '#7ab0b8');
    drawPixelNumber(ctx, gameState.ammo, ammoX + 12, sectionY + 22, 3, '#ffffff', 2);

    // Section 7: KEYS
    const keysX = ammoX + 68;
    drawBeveledSection(ctx, keysX, sectionY, 54, sectionH);
    drawPixelText(ctx, 'KEYS', keysX + 8, sectionY + 4, 1.3, '#7ab0b8');
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
    drawPixelText(ctx, weapon.label, weaponX + 8, sectionY + 4, 1.3, '#7ab0b8');
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
    // Full-screen dark red background (like original Wolf3D title)
    ctx.fillStyle = '#400000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Brick border pattern (original has decorative border)
    ctx.fillStyle = '#600000';
    ctx.fillRect(0, 0, canvasWidth, 16);
    ctx.fillRect(0, canvasHeight - 16, canvasWidth, 16);
    ctx.fillRect(0, 0, 16, canvasHeight);
    ctx.fillRect(canvasWidth - 16, 0, 16, canvasHeight);
    ctx.fillStyle = '#800000';
    ctx.fillRect(2, 2, canvasWidth - 4, 2);
    ctx.fillRect(2, 2, 2, canvasHeight - 4);

    // Title: WOLFENSTEIN 3-D
    ctx.fillStyle = '#d0a030';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WOLFENSTEIN', canvasWidth / 2, 100);
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('3-D', canvasWidth / 2, 170);

    // Subtitle
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#c0c0c0';
    ctx.fillText('EPISODE ONE: ESCAPE FROM WOLFENSTEIN', canvasWidth / 2, 210);

    // Wolf3D badge/emblem
    drawSprite(ctx, 'ui_badge_title_0', canvasWidth / 2 - 36, 230, 72, 72);

    // "Press any key" blinking
    const blink = Math.floor(Date.now() / 500) % 2;
    if (blink) {
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#d0a030';
        ctx.fillText('PRESS ENTER OR SPACE', canvasWidth / 2, 340);
    }

    // Credits
    ctx.font = '11px monospace';
    ctx.fillStyle = '#808080';
    ctx.fillText('Based on Wolfenstein 3D by id Software, 1992', canvasWidth / 2, 380);
    ctx.textAlign = 'start';
}

function drawMenuOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    // Full-screen dark blue background (original menu style)
    ctx.fillStyle = '#0a1828';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Title
    ctx.fillStyle = '#d0a030';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WOLFENSTEIN 3-D', canvasWidth / 2, 60);

    // Menu border
    const menuW = 340;
    const menuH = 220;
    const menuX = (canvasWidth - menuW) / 2;
    const menuY = 90;

    // Dark teal panel (original menu background)
    ctx.fillStyle = '#1a3040';
    ctx.fillRect(menuX, menuY, menuW, menuH);
    // Border
    ctx.fillStyle = '#4a7888';
    ctx.fillRect(menuX, menuY, menuW, 2);
    ctx.fillRect(menuX, menuY, 2, menuH);
    ctx.fillStyle = '#0a1018';
    ctx.fillRect(menuX, menuY + menuH - 2, menuW, 2);
    ctx.fillRect(menuX + menuW - 2, menuY, 2, menuH);

    // Menu items
    const items = ['NEW GAME', 'DIFFICULTY', 'HELP', 'BACK TO TITLE'];
    const itemH = 40;
    const startY = menuY + 30;

    ctx.font = 'bold 20px monospace';
    for (let i = 0; i < items.length; i++) {
        const y = startY + i * itemH;
        if (i === gameState.menuCursor) {
            // Selected item highlight
            ctx.fillStyle = '#2a5060';
            ctx.fillRect(menuX + 10, y - 4, menuW - 20, 30);
            ctx.fillStyle = '#ffffff';
            // Cursor arrow
            ctx.fillText('\u25B6', menuX + 20, y + 18);
        } else {
            ctx.fillStyle = '#8aa0b0';
        }
        ctx.fillText(items[i], menuX + 50, y + 18);
    }

    // Controls hint
    ctx.font = '12px monospace';
    ctx.fillStyle = '#506878';
    ctx.fillText('Arrow Keys to select, Enter to confirm, Esc to go back', canvasWidth / 2, menuY + menuH + 30);
    ctx.textAlign = 'start';
}

function drawDifficultyOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    ctx.fillStyle = '#0a1828';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#d0a030';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HOW TOUGH ARE YOU?', canvasWidth / 2, 60);

    const menuW = 400;
    const menuH = 260;
    const menuX = (canvasWidth - menuW) / 2;
    const menuY = 80;

    ctx.fillStyle = '#1a3040';
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.fillStyle = '#4a7888';
    ctx.fillRect(menuX, menuY, menuW, 2);
    ctx.fillRect(menuX, menuY, 2, menuH);
    ctx.fillStyle = '#0a1018';
    ctx.fillRect(menuX, menuY + menuH - 2, menuW, 2);
    ctx.fillRect(menuX + menuW - 2, menuY, 2, menuH);

    const difficulties = [
        { name: 'CAN I PLAY, DADDY?', desc: 'Easy — more ammo, weaker enemies' },
        { name: "DON'T HURT ME", desc: 'Normal — balanced challenge' },
        { name: "BRING 'EM ON!", desc: 'Hard — tougher, smarter enemies' },
        { name: 'I AM DEATH INCARNATE!', desc: 'Nightmare — maximum challenge' },
    ];

    const itemH = 50;
    const startY = menuY + 25;

    for (let i = 0; i < difficulties.length; i++) {
        const y = startY + i * itemH;
        if (i === gameState.menuCursor) {
            ctx.fillStyle = '#2a5060';
            ctx.fillRect(menuX + 10, y - 4, menuW - 20, 42);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px monospace';
            ctx.fillText('\u25B6', menuX + 20, y + 18);
        } else {
            ctx.fillStyle = '#8aa0b0';
            ctx.font = 'bold 18px monospace';
        }
        ctx.fillText(difficulties[i].name, menuX + 50, y + 18);
        ctx.font = '12px monospace';
        ctx.fillStyle = i === gameState.menuCursor ? '#b0c0d0' : '#506070';
        ctx.fillText(difficulties[i].desc, menuX + 50, y + 34);
    }

    ctx.font = '12px monospace';
    ctx.fillStyle = '#506878';
    ctx.fillText('Arrow Keys to select, Enter to start, Esc to go back', canvasWidth / 2, menuY + menuH + 30);
    ctx.textAlign = 'start';
}

function pct(n, total) {
    return total > 0 ? Math.floor((n / total) * 100) : 0;
}

function drawIntermissionOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    const summary = gameState.lastCompletedLevel;
    if (!summary) return;

    // Full-screen dark blue (original intermission background)
    ctx.fillStyle = '#0a1828';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const killPct = pct(summary.kills, summary.enemiesTotal);
    const secretPct = pct(summary.secrets, summary.secretsTotal);
    const treasurePct = pct(summary.treasures, summary.treasuresTotal);
    const timeBonus = Math.max(0, 500 - Math.floor(summary.time) * 2);
    const perfectKills = killPct === 100 ? 10000 : 0;
    const perfectSecrets = secretPct === 100 ? 10000 : 0;
    const perfectTreasures = treasurePct === 100 ? 10000 : 0;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#d0a030';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('FLOOR COMPLETED!', canvasWidth / 2, 50);

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(summary.name, canvasWidth / 2, 80);

    // Stats panel
    const panelW = 440;
    const panelX = (canvasWidth - panelW) / 2;
    const panelY = 100;

    ctx.fillStyle = '#1a3040';
    ctx.fillRect(panelX, panelY, panelW, 220);
    ctx.fillStyle = '#4a7888';
    ctx.fillRect(panelX, panelY, panelW, 2);
    ctx.fillRect(panelX, panelY, 2, 220);

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px monospace';
    const lx = panelX + 30;
    const rx = panelX + panelW - 30;
    let y = panelY + 36;
    const lineH = 32;

    // Time
    ctx.fillStyle = '#8ab0c0';
    ctx.fillText('TIME', lx, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(formatTime(summary.time), rx, y);
    ctx.textAlign = 'left';
    y += lineH;

    // Kill ratio
    ctx.fillStyle = '#8ab0c0';
    ctx.fillText('KILL RATIO', lx, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = killPct === 100 ? '#d0a030' : '#ffffff';
    ctx.fillText(`${killPct}%`, rx, y);
    ctx.textAlign = 'left';
    y += lineH;

    // Secret ratio
    ctx.fillStyle = '#8ab0c0';
    ctx.fillText('SECRET RATIO', lx, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = secretPct === 100 ? '#d0a030' : '#ffffff';
    ctx.fillText(`${secretPct}%`, rx, y);
    ctx.textAlign = 'left';
    y += lineH;

    // Treasure ratio
    ctx.fillStyle = '#8ab0c0';
    ctx.fillText('TREASURE RATIO', lx, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = treasurePct === 100 ? '#d0a030' : '#ffffff';
    ctx.fillText(`${treasurePct}%`, rx, y);
    ctx.textAlign = 'left';
    y += lineH + 8;

    // Bonus line
    const totalBonus = timeBonus + perfectKills + perfectSecrets + perfectTreasures;
    ctx.fillStyle = '#d0a030';
    ctx.fillText('BONUS', lx, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${totalBonus}`, rx, y);
    ctx.textAlign = 'left';
    y += lineH;

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('SCORE', lx, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${summary.score + totalBonus}`, rx, y);

    // 100% bonus messages
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace';
    if (killPct === 100) {
        ctx.fillStyle = '#d0a030';
        ctx.fillText('100% KILLS BONUS: 10,000', canvasWidth / 2, panelY + 232);
    }

    // Continue prompt
    const blink = Math.floor(Date.now() / 600) % 2;
    if (blink) {
        ctx.fillStyle = '#d0a030';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRESS ENTER TO CONTINUE', canvasWidth / 2, 350);
    }
    ctx.textAlign = 'start';
}

function drawDeathOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    // Dark red overlay (original death screen: red-tinted)
    ctx.fillStyle = 'rgba(80, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.textAlign = 'center';

    // BJ face (pain)
    drawSprite(ctx, 'ui_face_critical_0', canvasWidth / 2 - 40, 100, 80, 80);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 42px monospace';
    ctx.fillText('YOU DIED', canvasWidth / 2, 230);

    ctx.fillStyle = '#c0c0c0';
    ctx.font = '16px monospace';
    ctx.fillText(`LIVES REMAINING: ${Math.max(0, gameState.lives)}`, canvasWidth / 2, 270);

    const blink = Math.floor(Date.now() / 600) % 2;
    if (blink) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRESS ENTER TO CONTINUE', canvasWidth / 2, 320);
    }
    ctx.textAlign = 'start';
}

function drawGameOverOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    // Full black screen (original game over)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.textAlign = 'center';

    // BJ face
    drawSprite(ctx, 'ui_face_critical_0', canvasWidth / 2 - 40, 80, 80, 80);

    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px monospace';
    ctx.fillText('GAME OVER', canvasWidth / 2, 220);

    ctx.fillStyle = '#c0c0c0';
    ctx.font = '18px monospace';
    ctx.fillText(`FINAL SCORE: ${gameState.score}`, canvasWidth / 2, 270);
    ctx.fillText(`FLOORS CLEARED: ${gameState.levelsCompleted}`, canvasWidth / 2, 296);

    const blink = Math.floor(Date.now() / 600) % 2;
    if (blink) {
        ctx.fillStyle = '#d0a030';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRESS ENTER TO RETURN TO MENU', canvasWidth / 2, 350);
    }
    ctx.textAlign = 'start';
}

function drawVictoryOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    // Dark blue victory screen
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.textAlign = 'center';

    // Gold border
    ctx.fillStyle = '#d0a030';
    ctx.fillRect(20, 20, canvasWidth - 40, 4);
    ctx.fillRect(20, canvasHeight - 24, canvasWidth - 40, 4);
    ctx.fillRect(20, 20, 4, canvasHeight - 40);
    ctx.fillRect(canvasWidth - 24, 20, 4, canvasHeight - 40);

    // Title
    ctx.fillStyle = '#d0a030';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('EPISODE COMPLETE!', canvasWidth / 2, 80);

    // BJ face (healthy, victorious)
    drawSprite(ctx, 'ui_face_healthy_0', canvasWidth / 2 - 40, 100, 80, 80);

    // Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`FINAL SCORE: ${gameState.score}`, canvasWidth / 2, 220);
    ctx.fillText(`TOTAL KILLS: ${gameState.kills}`, canvasWidth / 2, 250);
    ctx.fillText(`SECRETS FOUND: ${gameState.secrets}`, canvasWidth / 2, 280);
    ctx.fillText(`TREASURES: ${gameState.treasures}`, canvasWidth / 2, 310);

    // Story ending text
    ctx.fillStyle = '#8ab0c0';
    ctx.font = '14px monospace';
    ctx.fillText('You have escaped from the Nazi fortress!', canvasWidth / 2, 344);
    ctx.fillText('But the war is far from over...', canvasWidth / 2, 364);

    const blink = Math.floor(Date.now() / 600) % 2;
    if (blink) {
        ctx.fillStyle = '#d0a030';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRESS ENTER TO RETURN TO MENU', canvasWidth / 2, 390);
    }
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
    } else if (gameState.levelStatus === 'menu') {
        drawMenuOverlay(ctx, canvasWidth, canvasHeight, gameState);
    } else if (gameState.levelStatus === 'difficulty') {
        drawDifficultyOverlay(ctx, canvasWidth, canvasHeight, gameState);
    } else if (gameState.levelStatus === 'intermission') {
        drawIntermissionOverlay(ctx, canvasWidth, canvasHeight, gameState);
    } else if (gameState.levelStatus === 'dead') {
        drawDeathOverlay(ctx, canvasWidth, canvasHeight, gameState);
    } else if (gameState.levelStatus === 'gameover') {
        drawGameOverOverlay(ctx, canvasWidth, canvasHeight, gameState);
    } else if (gameState.levelStatus === 'victory') {
        drawVictoryOverlay(ctx, canvasWidth, canvasHeight, gameState);
    }

    if (gameState.paused) {
        drawPauseOverlay(ctx, canvasWidth, canvasHeight, level);
    }
    if (gameState.showHelp) {
        drawHelpOverlay(ctx, canvasWidth, canvasHeight, level);
    }

    ctx.restore();
}
