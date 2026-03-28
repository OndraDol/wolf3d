/**
 * HUD, title shell and flow overlays drawn on top of the pixel scene.
 */

import { getWeapon, WEAPON_ORDER } from '../game/weapons.js';
import { DIFFICULTY, DIFFICULTY_ORDER } from '../game/state.js';
import { spriteGenerator } from '../sprites/SpriteGenerator.js';

function formatKeys(keys) {
    const parts = [];
    if (keys.has('gold')) {
        parts.push('GOLD');
    }
    if (keys.has('silver')) {
        parts.push('SILVER');
    }
    return parts.length > 0 ? parts.join(' / ') : '--';
}

function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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

function drawCrosshair(ctx, canvasWidth, canvasHeight, gameState) {
    const canFire = gameState.canFire() && gameState.ammo >= getWeapon(gameState.weapon).ammoCost;
    ctx.strokeStyle = canFire ? 'rgba(255,255,255,0.78)' : 'rgba(255,128,128,0.78)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 8, canvasHeight / 2);
    ctx.lineTo(canvasWidth / 2 + 8, canvasHeight / 2);
    ctx.moveTo(canvasWidth / 2, canvasHeight / 2 - 8);
    ctx.lineTo(canvasWidth / 2, canvasHeight / 2 + 8);
    ctx.stroke();
}

function drawTopStrip(ctx, canvasWidth, gameState, level) {
    const objective = level?.metadata?.primaryObjective ?? level?.metadata?.briefing ?? '';
    if (!objective) {
        return;
    }

    ctx.fillStyle = 'rgba(10, 10, 10, 0.56)';
    ctx.fillRect(0, 0, canvasWidth, 24);
    ctx.fillStyle = '#e4dcc2';
    ctx.font = '12px monospace';
    ctx.fillText(objective, 12, 16);
    ctx.textAlign = 'right';
    ctx.fillText(`TIME ${formatTime(gameState.levelTime)}`, canvasWidth - 12, 16);
    ctx.textAlign = 'start';
}

function drawStatusBar(ctx, canvasWidth, canvasHeight, gameState, level) {
    const weapon = getWeapon(gameState.weapon);
    const loadText = weapon.ammoCost > 0 ? String(weapon.ammoCost) : '--';
    const hudHeight = 64;
    const top = canvasHeight - hudHeight;

    const panelGradient = ctx.createLinearGradient(0, top, 0, canvasHeight);
    panelGradient.addColorStop(0, 'rgba(18, 26, 34, 0.96)');
    panelGradient.addColorStop(1, 'rgba(7, 10, 14, 0.98)');
    ctx.fillStyle = panelGradient;
    ctx.fillRect(0, top, canvasWidth, hudHeight);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(0, top + 0.5);
    ctx.lineTo(canvasWidth, top + 0.5);
    ctx.stroke();

    ctx.fillStyle = '#f2e9d4';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(level?.name ?? 'WOLF3D', 12, top + 18);
    ctx.font = '12px monospace';
    ctx.fillText(`FLOOR ${String(gameState.currentLevelNumber).padStart(2, '0')}`, 12, top + 36);
    ctx.fillText(`SCORE ${String(gameState.score).padStart(5, '0')}`, 12, top + 52);

    drawSprite(ctx, 'ui_stat_health_0', 100, top + 11, 18, 18);
    drawSprite(ctx, 'ui_stat_armor_0', 100, top + 31, 18, 18);
    drawSprite(ctx, 'ui_stat_ammo_0', 206, top + 28, 18, 18);

    ctx.fillStyle = '#7d1919';
    ctx.fillRect(122, top + 20, 118, 10);
    ctx.fillStyle = '#c63e3e';
    ctx.fillRect(122, top + 20, Math.max(0, Math.min(118, gameState.health * 1.18)), 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(122, top + 20, 118, 10);
    ctx.fillStyle = '#1e335d';
    ctx.fillRect(122, top + 36, 118, 8);
    ctx.fillStyle = '#4b87d9';
    ctx.fillRect(122, top + 36, Math.max(0, Math.min(118, gameState.armor * 1.18)), 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.strokeRect(122, top + 36, 118, 8);
    ctx.fillStyle = '#f2e9d4';
    ctx.fillText(`HP ${String(gameState.health).padStart(3, ' ')}`, 122, top + 48);
    ctx.fillText(`AR ${String(gameState.armor).padStart(3, ' ')}`, 122, top + 60);
    ctx.fillText(`AMMO ${String(gameState.ammo).padStart(2, '0')}`, 226, top + 48);
    drawSprite(ctx, getFaceSpriteKey(gameState), 255, top + 7, 56, 56);

    drawSprite(ctx, 'ui_stat_kill_0', 312, top + 9, 14, 14);
    drawSprite(ctx, 'ui_stat_pickup_0', 312, top + 25, 14, 14);
    drawSprite(ctx, 'ui_stat_secret_0', 458, top + 9, 14, 14);
    drawSprite(ctx, 'ui_stat_treasure_0', 458, top + 25, 14, 14);

    ctx.fillText(`KILLS ${gameState.killsInLevel}/${gameState.enemiesTotal}`, 330, top + 22);
    ctx.fillText(`PICKUPS ${gameState.pickupsCollected}/${gameState.pickupsTotal}`, 330, top + 38);
    ctx.fillText(`KEYS ${formatKeys(gameState.keys)}`, 330, top + 56);
    ctx.fillText(`SEC ${gameState.secretsInLevel}/${gameState.secretsTotal}`, 476, top + 22);
    ctx.fillText(`TRS ${gameState.treasuresInLevel}/${gameState.treasuresTotal}`, 476, top + 38);

    if (gameState.keys.has('gold')) {
        drawSprite(ctx, 'ui_key_gold_0', 458, top + 42, 16, 16);
    }
    if (gameState.keys.has('silver')) {
        drawSprite(ctx, 'ui_key_silver_0', 476, top + 42, 16, 16);
    }

    ctx.textAlign = 'right';
    ctx.fillText(weapon.label, canvasWidth - 12, top + 18);
    ctx.fillText(`LOAD ${loadText}  SLOT ${weapon.slot}`, canvasWidth - 12, top + 36);
    ctx.fillText(
        WEAPON_ORDER.map((weaponId) => {
            const current = weaponId === gameState.weapon ? '>' : ' ';
            return `${current}${getWeapon(weaponId).slot}:${gameState.hasWeapon(weaponId) ? 'ON' : '--'}`;
        }).join('  '),
        canvasWidth - 12,
        top + 52
    );
    ctx.textAlign = 'start';
}

function drawToast(ctx, canvasWidth, gameState) {
    if (!gameState.levelMessage) {
        return;
    }

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
    ctx.fillText('WOLF3D // E1', panel.left + 24, panel.top + 42);
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

    drawCrosshair(ctx, canvasWidth, canvasHeight, gameState);
    drawTopStrip(ctx, canvasWidth, gameState, level);
    drawStatusBar(ctx, canvasWidth, canvasHeight, gameState, level);
    drawWeapon(ctx, canvasWidth, canvasHeight, gameState);
    drawToast(ctx, canvasWidth, gameState);

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
