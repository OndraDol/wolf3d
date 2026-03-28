/**
 * Wolf3D Web Remake — Main entry point & game loop
 * Vše generováno kódem, žádné externí assety.
 */

import { Screen } from '../renderer/screen.js';
import { Camera } from './camera.js';
import { GameMap } from './map.js';
import { Input } from './input.js';
import { Raycaster } from './raycaster.js';

// ── Konfigurace ──────────────────────────────────────────────
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 400;
const TARGET_FPS = 60;

// ── Stav hry ─────────────────────────────────────────────────
let screen;
let camera;
let map;
let input;
let raycaster;

// FPS tracking
let lastTime = 0;
let frameCount = 0;
let fpsAccumulator = 0;
let currentFps = 0;
const fpsElement = document.getElementById('fps');

// ── Inicializace ─────────────────────────────────────────────
function init() {
    const canvas = document.getElementById('screen');

    screen = new Screen(canvas, SCREEN_WIDTH, SCREEN_HEIGHT);
    map = new GameMap();
    camera = new Camera(map);
    input = new Input();
    raycaster = new Raycaster(map, SCREEN_WIDTH, SCREEN_HEIGHT);

    window.addEventListener('resize', () => screen.resize());
    screen.resize();

    requestAnimationFrame(loop);
}

// ── Hlavní smyčka ────────────────────────────────────────────
function loop(timestamp) {
    const dt = lastTime ? (timestamp - lastTime) / 1000 : 1 / TARGET_FPS;
    lastTime = timestamp;

    // FPS counter
    frameCount++;
    fpsAccumulator += dt;
    if (fpsAccumulator >= 0.5) {
        currentFps = Math.round(frameCount / fpsAccumulator);
        fpsElement.textContent = `FPS: ${currentFps}`;
        frameCount = 0;
        fpsAccumulator = 0;
    }

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

// ── Update ───────────────────────────────────────────────────
function update(dt) {
    camera.update(input, dt);
}

// ── Render ───────────────────────────────────────────────────
function draw() {
    screen.clear();

    // Raycasting → wall columns (bude implementováno)
    // raycaster.castRays(camera, screen);

    screen.present();
}

// ── Start ────────────────────────────────────────────────────
init();
