/**
 * Wall and door column rendering from the shared render frame.
 */

import { getTexture, TEX_SIZE } from '../procedural/textures.js';

const FOG_NEAR = 6;
const FOG_FAR = 20;
const FOG_MAX = 0.50;

function shadeColor(color, brightness) {
    const r = color & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = (color >> 16) & 0xFF;

    return (
        0xFF000000 |
        (Math.round(b * brightness) << 16) |
        (Math.round(g * brightness) << 8) |
        Math.round(r * brightness)
    );
}

function applyFog(color, distance) {
    const fogAmount = Math.max(0, Math.min(FOG_MAX, ((distance - FOG_NEAR) / (FOG_FAR - FOG_NEAR)) * FOG_MAX));
    if (fogAmount <= 0) {
        return color;
    }

    const r = color & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = (color >> 16) & 0xFF;
    const retained = 1 - fogAmount;

    return (
        0xFF000000 |
        (Math.round(b * retained) << 16) |
        (Math.round(g * retained) << 8) |
        Math.round(r * retained)
    );
}

export function drawWalls(screen, frame) {
    const rays = frame.rays;
    const centerY = screen.height / 2;
    const pixels = screen.pixels;
    const screenWidth = screen.width;
    const screenHeight = screen.height;

    for (let x = 0; x < rays.length; x++) {
        const ray = rays[x];

        if (!ray || !Number.isFinite(ray.distance) || ray.distance <= 0 || ray.tileType <= 0) {
            continue;
        }

        const columnHeight = screen.height / ray.distance;
        const yStart = Math.max(0, Math.floor(centerY - columnHeight / 2));
        const yEnd = Math.min(screenHeight - 1, Math.floor(centerY + columnHeight / 2));
        const texture = getTexture(ray.tileType);
        const texX = Math.min(TEX_SIZE - 1, Math.max(0, Math.floor(ray.textureX * (TEX_SIZE - 1))));
        const brightness = ray.side === 1 ? 0.75 : 1;

        for (let y = yStart; y <= yEnd; y++) {
            const sampleY = (y - (centerY - columnHeight / 2)) / Math.max(columnHeight, 1);
            const texY = Math.min(TEX_SIZE - 1, Math.max(0, Math.floor(sampleY * TEX_SIZE)));
            const texel = texture[texY * TEX_SIZE + texX];
            pixels[y * screenWidth + x] = applyFog(shadeColor(texel, brightness), ray.distance);
        }
    }
}
