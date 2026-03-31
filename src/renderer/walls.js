/**
 * Wall and door column rendering from the shared render frame.
 */

import { getTexture, TEX_SIZE } from '../procedural/textures.js';

// Original Wolf3D used subtle distance darkening, not heavy fog.
// Walls darken gently — never fade to pure black.
const FOG_NEAR = 4;
const FOG_FAR = 16;
const FOG_MAX = 0.65; // max darkening — walls never go fully black

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
    const fogAmount = Math.min(FOG_MAX, Math.max(0, (distance - FOG_NEAR) / (FOG_FAR - FOG_NEAR)) * FOG_MAX);
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
    const viewportHeight = screen.viewportHeight;
    const centerY = viewportHeight / 2;
    const pixels = screen.pixels;
    const screenWidth = screen.width;
    const screenHeight = viewportHeight;

    for (let x = 0; x < rays.length; x++) {
        const ray = rays[x];

        if (!ray || !Number.isFinite(ray.distance) || ray.distance <= 0 || ray.tileType <= 0) {
            continue;
        }

        const columnHeight = viewportHeight / ray.distance;
        const yStart = Math.max(0, Math.floor(centerY - columnHeight / 2));
        const yEnd = Math.min(screenHeight - 1, Math.floor(centerY + columnHeight / 2));
        const texture = getTexture(ray.tileType);
        const texX = Math.min(TEX_SIZE - 1, Math.max(0, Math.floor(ray.textureX * (TEX_SIZE - 1))));
        const brightness = ray.side === 1 ? 0.72 : 1;

        for (let y = yStart; y <= yEnd; y++) {
            const sampleY = (y - (centerY - columnHeight / 2)) / Math.max(columnHeight, 1);
            const texY = Math.min(TEX_SIZE - 1, Math.max(0, Math.floor(sampleY * TEX_SIZE)));
            const texel = texture[texY * TEX_SIZE + texX];
            pixels[y * screenWidth + x] = applyFog(shadeColor(texel, brightness), ray.distance);
        }
    }
}
