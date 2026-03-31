import { DoorPainter } from './doors/DoorPainter.js';
import { ElevatorDoorPainter } from './doors/ElevatorDoorPainter.js';
import { ElevatorSwitchPainter } from './doors/ElevatorSwitchPainter.js';
import { LockedDoorGoldPainter } from './doors/LockedDoorGoldPainter.js';
import { LockedDoorSilverPainter } from './doors/LockedDoorSilverPainter.js';
import { BlueStonePainter } from './walls/BlueStonePainter.js';
import { BrickWallPainter } from './walls/BrickWallPainter.js';
import { ElevatorExitPainter } from './walls/ElevatorExitPainter.js';
import { GrayStonePainter } from './walls/GrayStonePainter.js';
import { MetalPanelPainter } from './walls/MetalPanelPainter.js';
import { OrnamentWallPainter } from './walls/OrnamentWallPainter.js';
import { PrisonBarsPainter } from './walls/PrisonBarsPainter.js';
import { WoodPainter } from './walls/WoodPainter.js';

export const TEXTURE_SIZE = 64;

class FallbackPainter extends BrickWallPainter {
    paint(ctx, width, height) {
        this.clear(ctx, width, height, '#3a3a3a');
        ctx.fillStyle = '#5a5a5a';
        for (let y = 0; y < height; y += 8) {
            for (let x = 0; x < width; x += 8) {
                if (((x + y) / 8) % 2 === 0) {
                    ctx.fillRect(x, y, 8, 8);
                }
            }
        }
    }
}

function createRuntimeCanvas(size) {
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(size, size);
        return { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
    }

    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        return { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
    }

    throw new Error('Canvas 2D texture generation requires a browser Canvas context.');
}

export class TextureGenerator {
    constructor(size = TEXTURE_SIZE) {
        this.size = size;
        this.cache = new Map();
        this.canvas = null;
        this.ctx = null;
        this.fallbackPainter = new FallbackPainter();
        this.registry = new Map([
            [1, { label: 'Tile 1 — Brick Wall', painter: new BrickWallPainter(), group: 'walls' }],
            [2, { label: 'Tile 2 — Blue Stone', painter: new BlueStonePainter(), group: 'walls' }],
            [3, { label: 'Tile 3 — Wood Panels', painter: new WoodPainter(), group: 'walls' }],
            [4, { label: 'Tile 4 — Gray Stone', painter: new GrayStonePainter(), group: 'walls' }],
            [5, { label: 'Tile 5 — Metal Panel', painter: new MetalPanelPainter(), group: 'walls' }],
            [6, { label: 'Tile 6 — Ornament Wall', painter: new OrnamentWallPainter(), group: 'walls' }],
            [7, { label: 'Tile 7 — Elevator Exit Panel', painter: new ElevatorExitPainter(), group: 'walls' }],
            [8, { label: 'Tile 8 — Prison Bars', painter: new PrisonBarsPainter(), group: 'walls' }],
            [64, { label: 'Tile 64 — Standard Door', painter: new DoorPainter(), group: 'doors' }],
            [65, { label: 'Tile 65 — Gold Lock Door', painter: new LockedDoorGoldPainter(), group: 'doors' }],
            [66, { label: 'Tile 66 — Silver Lock Door', painter: new LockedDoorSilverPainter(), group: 'doors' }],
            [67, { label: 'Tile 67 — Elevator Door', painter: new ElevatorDoorPainter(), group: 'doors' }],
            [68, { label: 'Tile 68 — Elevator Switch', painter: new ElevatorSwitchPainter(), group: 'doors' }],
            [50, { label: 'Tile 50 — Push Wall (secret)', painter: new BrickWallPainter(), group: 'walls' }],
        ]);
    }

    ensureContext() {
        if (!this.ctx) {
            const runtime = createRuntimeCanvas(this.size);
            this.canvas = runtime.canvas;
            this.ctx = runtime.ctx;
            this.ctx.imageSmoothingEnabled = false;
        }

        return this.ctx;
    }

    getManifest() {
        return [...this.registry.entries()]
            .map(([tileType, entry]) => ({
                tileType,
                label: entry.label,
                group: entry.group,
            }))
            .sort((left, right) => left.tileType - right.tileType);
    }

    paintTexture(tileType) {
        if (this.cache.has(tileType)) {
            return this.cache.get(tileType);
        }

        const ctx = this.ensureContext();
        ctx.clearRect(0, 0, this.size, this.size);

        const entry = this.registry.get(tileType);
        const painter = entry?.painter ?? this.fallbackPainter;
        painter.paint(ctx, this.size, this.size);
        const pixels = painter.exportToUint32Array(ctx, this.size, this.size);
        this.cache.set(tileType, pixels);
        return pixels;
    }

    preload(tileTypes = this.getManifest().map((entry) => entry.tileType)) {
        for (const tileType of tileTypes) {
            this.paintTexture(tileType);
        }
        return this.cache;
    }

    clearCache() {
        this.cache.clear();
    }
}

export const textureGenerator = new TextureGenerator();

