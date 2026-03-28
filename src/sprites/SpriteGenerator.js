import { BossPainter } from './enemies/BossPainter.js';
import { CommanderPainter } from './enemies/CommanderPainter.js';
import { DecorationPainter } from './decorations/DecorationPainter.js';
import { DogPainter } from './enemies/DogPainter.js';
import { GuardPainter } from './enemies/GuardPainter.js';
import { SSPainter } from './enemies/SSPainter.js';
import { PickupPainter } from './pickups/PickupPainter.js';
import { UIPainter } from './ui/UIPainter.js';
import { WeaponViewPainter } from './view/WeaponViewPainter.js';

export const SPRITE_WIDTH = 64;
export const SPRITE_HEIGHT = 64;

function createRuntimeCanvas(width, height) {
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height);
        return { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
    }

    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
    }

    throw new Error('Canvas 2D sprite generation requires a browser Canvas context.');
}

export class SpriteGenerator {
    constructor(width = SPRITE_WIDTH, height = SPRITE_HEIGHT) {
        this.width = width;
        this.height = height;
        this.canvas = null;
        this.ctx = null;
        this.cache = new Map();
        this.canvasCache = new Map();
        this.registry = new Map();
        this.painters = [
            new GuardPainter(),
            new SSPainter(),
            new DogPainter(),
            new CommanderPainter(),
            new BossPainter(),
            new PickupPainter(),
            new DecorationPainter(),
            new UIPainter(),
            new WeaponViewPainter(),
        ];

        for (const painter of this.painters) {
            for (const frame of painter.getFrames()) {
                this.registry.set(frame.key, {
                    ...frame,
                    painter,
                });
            }
        }
    }

    ensureContext() {
        if (!this.ctx) {
            const runtime = createRuntimeCanvas(this.width, this.height);
            this.canvas = runtime.canvas;
            this.ctx = runtime.ctx;
            this.ctx.imageSmoothingEnabled = false;
        }

        return this.ctx;
    }

    getManifest() {
        return [...this.registry.entries()]
            .map(([key, entry]) => ({
                key,
                label: entry.label,
            }))
            .sort((left, right) => left.key.localeCompare(right.key));
    }

    paintSprite(key) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const entry = this.registry.get(key);
        if (!entry) {
            throw new Error(`Unknown sprite key "${key}".`);
        }

        const ctx = this.ensureContext();
        ctx.clearRect(0, 0, this.width, this.height);
        entry.painter.paintFrame(ctx, this.width, this.height, key);
        const pixels = entry.painter.exportToUint32Array(ctx, this.width, this.height);
        this.cache.set(key, pixels);
        return pixels;
    }

    paintSpriteCanvas(key) {
        if (this.canvasCache.has(key)) {
            return this.canvasCache.get(key);
        }

        const pixels = this.paintSprite(key);
        const runtime = createRuntimeCanvas(this.width, this.height);
        const imageData = runtime.ctx.createImageData(this.width, this.height);
        new Uint32Array(imageData.data.buffer).set(pixels);
        runtime.ctx.putImageData(imageData, 0, 0);
        this.canvasCache.set(key, runtime.canvas);
        return runtime.canvas;
    }

    preload(keys = this.getManifest().map((entry) => entry.key)) {
        for (const key of keys) {
            this.paintSprite(key);
        }
        return this.cache;
    }

    clearCache() {
        this.cache.clear();
        this.canvasCache.clear();
    }
}

export const spriteGenerator = new SpriteGenerator();
