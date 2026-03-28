/**
 * Compatibility wrapper for the new Canvas 2D painted texture pipeline.
 * Existing renderer code can keep importing from this module while the
 * implementation now lives in `src/textures/`.
 */

import { TEXTURE_SIZE, textureGenerator } from '../textures/TextureGenerator.js';

export const TEX_SIZE = TEXTURE_SIZE;

export function initTextures(tileTypes) {
    textureGenerator.preload(tileTypes);
}

export function getTexture(tileType) {
    return textureGenerator.paintTexture(tileType);
}

export function getTextureManifest() {
    return textureGenerator.getManifest();
}

export function resetTextureCache() {
    textureGenerator.clearCache();
}

