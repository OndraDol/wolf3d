/**
 * HUD, title shell and flow overlays drawn on top of the pixel scene.
 * Status bar styled to match original Wolfenstein 3D (1992).
 */

import { getWeapon, WEAPON_ORDER } from '../game/weapons.js';
import { DIFFICULTY, DIFFICULTY_ORDER } from '../game/state.js';
import { spriteGenerator } from '../sprites/SpriteGenerator.js';

function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatEpisodeFloor(episode, floor) {
    if (episode <= 0) {
        return 'TRAINING';
    }

    return `EP ${String(episode).padStart(2, '0')} // FLOOR ${String(floor).padStart(2, '0')}`;
}

function getCampaignBadge(level) {
    const episode = level?.meta?.episode ?? 0;
    if (episode <= 0) {
        return 'WOLF3D // LAB';
    }

    return `WOLF3D // E${episode}`;
}

function drawSprite(ctx, key, x, y, width, height) {
    const sprite = spriteGenerator.paintSpriteCanvas(key);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, x, y, width, height);
    ctx.restore();
}

function getFaceSpriteKey(gameState) {
    if (gameState.damageFlash > 0) {
        return 'ui_face_pain_0';
    }
    if (gameState.health < 30) {
        return 'ui_face_critical_0';
    }
    if (gameState.health < 70) {
        return 'ui_face_wounded_0';
    }
    return 'ui_face_healthy_0';
}

function drawWeapon(ctx, canvasWidth, canvasHeight, gameState) {
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
    const drawY = canvasHeight - height + bob + activeRecoil + slide - 2;
    const key = `weapon_${activeWeapon.id}_${gameState.muzzleFlash > 0 && activeWeapon.id === weapon.id ? 'fire' : 'idle'}_0`;
    drawSprite(ctx, key, drawX, drawY, width, height);
}

// Draw beveled border section (Wolf3D style 3D beveled look)
function drawBeveledSection(ctx, x, y, w, h) {
    // Main background
    ctx.fillStyle = '#0000A8';
    ctx.fillRect(x, y, w, h);
    // Highlight (top, left)
    ctx.fillStyle = '#0000D8';
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y, 2, h);
    // Shadow (bottom, right)
    ctx.fillStyle = '#000078';
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x + w - 2, y, 2, h);
}

// Draw pixel-font style large number
function drawLargeNumber(ctx, text, x, y) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(text, x, y);
}

// Draw small label text
function drawLabel(ctx, text, x, y) {
    ctx.fillStyle = '#B0B0B0';
    ctx.font = '10px monospace';
    ctx.fillText(text, x, y);
}

function drawStatusBar(ctx, canvasWidth, canvasHeight, gameState, level) {
    const hudHeight = 80;
    const top = canvasHeight - hudHeight;

    // Bright blue background (original Wolf3D #0000A8)
    ctx.fillStyle = '#0000A8';
    ctx.fillRect(0, top, canvasWidth, hudHeight);

    // Top border highlight
    ctx.fillStyle = '#0000D8';
    ctx.fillRect(0, top, canvasWidth, 2);

    // Section layout: FLOOR | SCORE | LIVES | [BJ FACE] | HEALTH | AMMO | WEAPON ICON
    const sectionY = top + 6;
    const sectionH = 68;
    const sections = [
        { x: 4, w: 78 },     // FLOOR
        { x: 86, w: 100 },   // SCORE
        { x: 190, w: 68 },   // LIVES
        { x: 262, w: 68 },   // FACE (center)
        { x: 334, w: 90 },   // HEALTH
        { x: 428, w: 80 },   // AMMO
        { x: 512, w: 124 },  // WEAPON ICON
    ];

    for (const sec of sections) {
        drawBeveledSection(ctx, sec.x, sectionY, sec.w, sectionH);
    }

    ctx.textAlign = 'center';

    // FLOOR section
    drawLabel(ctx, 'FLOOR', sections[0].x + sections[0].w / 2, sectionY + 16);
    drawLargeNumber(ctx, String(gameState.currentLevelNumber || 1), sections[0].x + sections[0].w / 2, sectionY + 48);

    // SCORE section
    drawLabel(ctx, 'SCORE', sections[1].x + sections[1].w / 2, sectionY + 16);
    drawLargeNumber(ctx, String(gameState.score).padStart(7, '0'), sections[1].x + sections[1].w / 2, sectionY + 48);

    // LIVES section
    drawLabel(ctx, 'LIVES', sections[2].x + sections[2].w / 2, sectionY + 16);
    drawLargeNumber(ctx, String(gameState.lives ?? 3), sections[2].x + sections[2].w / 2, sectionY + 48);

    // BJ FACE (center, large ~48x48)
    const faceSection = sections[3];
    drawSprite(ctx, getFaceSpriteKey(gameState), faceSection.x + 10, sectionY + 10, 48, 48);

    // HEALTH section
    drawLabel(ctx, 'HEALTH', sections[4].x + sections[4].w / 2, sectionY + 16);
    drawLargeNumber(ctx, String(gameState.health) + '%', sections[4].x + sections[4].w / 2, sectionY + 48);

    // AMMO section
    drawLabel(ctx, 'AMMO', sections[5].x + sections[5].w / 2, sectionY + 16);
    const weapon = getWeapon(gameState.weapon);
    const ammoText = weapon.ammoCost > 0 ? String(gameState.ammo) : '--';
    drawLargeNumber(ctx, ammoText, sections[5].x + sections[5].w / 2, sectionY + 48);

    // WEAPON ICON section
    const weaponSection = sections[6];
    const weaponKey = `weapon_${weapon.id}_idle_0`;
    drawSprite(ctx, weaponKey, weaponSection.x + 30, sectionY + 8, 52, 52);

    // Keys display (small, below face)
    if (gameState.keys.has('gold')) {
        drawSprite(ctx, 'ui_key_gold_0', faceSection.x + 4, sectionY + 56, 12, 12);
    }
    if (gameState.keys.has('silver')) {
        drawSprite(ctx, 'ui_key_silver_0', faceSection.x + 52, sectionY + 56, 12, 12);
    }

    ctx.textAlign = 'start';
}

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
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 430, 314);

    drawSprite(ctx, 'ui_badge_title_0', panel.left + 334, panel.top + 18, 72, 72);
    ctx.fillStyle = '#fff1c0';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(getCampaignBadge(level), panel.left + 24, panel.top + 42);
    ctx.font = 'bold 18px monospace';
    ctx.fillText(level?.name ?? 'START MISSION', panel.left + 24, panel.top + 74);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#d7d2c6';
    ctx.fillText(level?.metadata?.briefing ?? 'Begin the campaign run.', panel.left + 24, panel.top + 102);
    ctx.fillStyle = '#fff1c0';
    ctx.fillText('SELECT DIFFICULTY', panel.left + 24, panel.top + 132);
    DIFFICULTY_ORDER.forEach((difficulty, index) => {
        const selected = difficulty === gameState.difficulty;
        ctx.fillStyle = selected ? '#fff6ce' : '#d7d2c6';
        ctx.fillText(
            `${selected ? '>' : ' '} ${DIFFICULTY[difficulty].label}`,
            panel.left + 36,
            panel.top + 156 + (index * 22)
        );
    });
    ctx.fillStyle = '#d7d2c6';
    ctx.fillText('Up/Down or W/S choose difficulty  Enter/Space deploy', panel.left + 24, panel.top + 224);
    ctx.fillText('WASD move  QE strafe  Space use  Ctrl/Enter fire', panel.left + 24, panel.top + 246);
    ctx.fillText('1/2/3/4/5 switch weapon  Esc pause  H help', panel.left + 24, panel.top + 268);
    ctx.fillStyle = '#fff1c0';
    ctx.fillText('Query parameter `?level=` still works for direct starts.', panel.left + 24, panel.top + 290);
}

function drawIntermissionOverlay(ctx, canvasWidth, canvasHeight, gameState) {
    const summary = gameState.lastCompletedLevel;
    if (!summary) {
        return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 420, 248);

    ctx.fillStyle = '#fff1c0';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('FLOOR CLEAR', panel.left + 24, panel.top + 40);
    ctx.font = 'bold 16px monospace';
    ctx.fillText(formatEpisodeFloor(summary.episode ?? 0, summary.floor ?? 0), panel.left + 24, panel.top + 70);
    ctx.fillText(summary.name, panel.left + 24, panel.top + 92);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#d7d2c6';
    ctx.fillText(`TIME     ${formatTime(summary.time)}`, panel.left + 24, panel.top + 120);
    ctx.fillText(`KILLS    ${summary.kills}/${summary.enemiesTotal}`, panel.left + 24, panel.top + 144);
    ctx.fillText(`PICKUPS  ${summary.pickups}/${summary.pickupsTotal}`, panel.left + 24, panel.top + 168);
    ctx.fillText(`HEALTH   ${summary.health}`, panel.left + 24, panel.top + 192);
    ctx.fillText(`ARMOR    ${summary.armor}`, panel.left + 24, panel.top + 216);
    ctx.fillText(`SCORE    ${summary.score}`, panel.left + 220, panel.top + 120);
    ctx.fillText(`NEXT     ${gameState.pendingLevelName}`, panel.left + 220, panel.top + 144);
    ctx.fillText(`SECRETS  ${summary.secrets}/${summary.secretsTotal}`, panel.left + 220, panel.top + 168);
    ctx.fillText(`TREASURE ${summary.treasures}/${summary.treasuresTotal}`, panel.left + 220, panel.top + 192);
    ctx.fillStyle = '#fff1c0';
    ctx.fillText('Press Enter to deploy to the next floor.', panel.left + 24, panel.top + 232);
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
    const panel = drawCenteredPanel(ctx, canvasWidth, canvasHeight, 470, 260);
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
    ctx.fillText('Secrets and treasure boost score and intermission stats.', panel.left + 20, panel.top + 196);
    ctx.fillText('F11, P or ` toggles fullscreen.', panel.left + 20, panel.top + 220);
    ctx.fillText('H or Esc closes this overlay.', panel.left + 20, panel.top + 244);
}

export function drawHUD(ctx, frame) {
    const { gameState, level } = frame;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const weapon = getWeapon(gameState.weapon);

    ctx.save();

    if (gameState.screenFade > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, gameState.screenFade)})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    if (gameState.damageFlash > 0) {
        ctx.fillStyle = `rgba(172, 18, 18, ${Math.min(0.35, gameState.damageFlash * 1.2)})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    if (gameState.pickupFlash > 0) {
        ctx.fillStyle = `rgba(255, 240, 164, ${Math.min(0.22, gameState.pickupFlash)})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    if (gameState.muzzleFlash > 0 && weapon.screenFlash !== false) {
        ctx.fillStyle = `rgba(255, 226, 164, ${Math.min(0.18, gameState.muzzleFlash * 1.4)})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // No crosshair, no top strip, no toast — original Wolf3D had none
    drawStatusBar(ctx, canvasWidth, canvasHeight, gameState, level);
    drawWeapon(ctx, canvasWidth, canvasHeight, gameState);

    if (gameState.levelStatus === 'title') {
        drawTitleOverlay(ctx, canvasWidth, canvasHeight, gameState, level);
    } else if (gameState.levelStatus === 'intermission') {
        drawIntermissionOverlay(ctx, canvasWidth, canvasHeight, gameState);
    } else if (gameState.levelStatus === 'dead') {
        drawEndOverlay(ctx, canvasWidth, canvasHeight, 'YOU DIED', 'Press Enter to restart the floor');
    } else if (gameState.levelStatus === 'victory') {
        drawEndOverlay(ctx, canvasWidth, canvasHeight, 'CAMPAIGN CLEAR', 'Press Enter to restart from Episode 1');
    }

    if (gameState.paused) {
        drawPauseOverlay(ctx, canvasWidth, canvasHeight, level);
    }
    if (gameState.showHelp) {
        drawHelpOverlay(ctx, canvasWidth, canvasHeight, level);
    }

    ctx.restore();
}
