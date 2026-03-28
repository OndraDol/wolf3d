const DEFAULT_ALPHA = 0xFF000000;

function clampChannel(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;

    if (full.length !== 6) {
        throw new Error(`Invalid color "${hex}". Expected #rgb or #rrggbb.`);
    }

    return {
        r: Number.parseInt(full.slice(0, 2), 16),
        g: Number.parseInt(full.slice(2, 4), 16),
        b: Number.parseInt(full.slice(4, 6), 16),
    };
}

function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((value) => clampChannel(value).toString(16).padStart(2, '0')).join('')}`;
}

export class TexturePainter {
    clear(ctx, width, height, color = '#000000') {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }

    hash(x, y, salt = 0) {
        const value = Math.sin((x * 127.1) + (y * 311.7) + (salt * 74.7)) * 43758.5453123;
        return value - Math.floor(value);
    }

    jitterColor(baseHex, range = 8, salt = Math.random() * 1000) {
        const base = hexToRgb(baseHex);
        const jitterR = (this.hash(base.r, base.g, salt) * 2 - 1) * range;
        const jitterG = (this.hash(base.g, base.b, salt + 11) * 2 - 1) * range;
        const jitterB = (this.hash(base.b, base.r, salt + 23) * 2 - 1) * range;
        return rgbToHex(base.r + jitterR, base.g + jitterG, base.b + jitterB);
    }

    adjustColor(baseHex, amount = 0) {
        const base = hexToRgb(baseHex);
        const factor = 1 + amount;
        return rgbToHex(base.r * factor, base.g * factor, base.b * factor);
    }

    drawBrick(ctx, x, y, width, height, color, aoIntensity = 0.18) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = this.adjustColor(color, 0.12);
        ctx.fillRect(x, y, width, 1);
        ctx.fillRect(x, y, 1, height);

        ctx.fillStyle = this.adjustColor(color, -aoIntensity);
        ctx.fillRect(x, y + height - 1, width, 1);
        ctx.fillRect(x + width - 1, y, 1, height);
    }

    addSurfaceNoise(ctx, width, height, intensity = 5) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let index = 0; index < data.length; index += 4) {
            if (data[index + 3] === 0) {
                continue;
            }

            const jitter = Math.round((Math.random() * 2 - 1) * intensity);
            data[index] = clampChannel(data[index] + jitter);
            data[index + 1] = clampChannel(data[index + 1] + jitter);
            data[index + 2] = clampChannel(data[index + 2] + jitter);
        }

        ctx.putImageData(imageData, 0, 0);
    }

    addAmbientOcclusion(ctx, rects, intensity = 0.16) {
        ctx.save();
        ctx.globalAlpha = intensity;
        ctx.fillStyle = '#000000';

        for (const rect of rects) {
            ctx.fillRect(rect.x, rect.y + rect.h - 2, rect.w, 2);
            ctx.fillRect(rect.x + rect.w - 2, rect.y, 2, rect.h);
        }

        ctx.restore();
    }

    drawRivet(ctx, centerX, centerY, radius = 2) {
        const gradient = ctx.createRadialGradient(centerX - radius * 0.35, centerY - radius * 0.35, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#d8dde4');
        gradient.addColorStop(0.55, '#8f969f');
        gradient.addColorStop(1, '#545b64');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.32)';
        ctx.beginPath();
        ctx.arc(centerX - radius * 0.35, centerY - radius * 0.35, Math.max(0.8, radius * 0.35), 0, Math.PI * 2);
        ctx.fill();
    }

    drawWoodGrain(ctx, width, height, baseColor, grainColor) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.strokeStyle = grainColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.34;

        for (let y = 4; y < height; y += 5) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 2) {
                const wave = Math.sin((x * 0.32) + (y * 0.18)) * 1.6;
                if (x === 0) {
                    ctx.moveTo(x, y + wave);
                } else {
                    ctx.lineTo(x, y + wave);
                }
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    pixelate(ctx, width, height, blockSize = 1) {
        if (blockSize <= 1) {
            return;
        }

        const imageData = ctx.getImageData(0, 0, width, height);
        const source = imageData.data;
        const next = new Uint8ClampedArray(source.length);

        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                const sampleIndex = ((y * width) + x) * 4;
                for (let offsetY = 0; offsetY < blockSize; offsetY++) {
                    for (let offsetX = 0; offsetX < blockSize; offsetX++) {
                        const px = x + offsetX;
                        const py = y + offsetY;
                        if (px >= width || py >= height) {
                            continue;
                        }

                        const index = ((py * width) + px) * 4;
                        next[index] = source[sampleIndex];
                        next[index + 1] = source[sampleIndex + 1];
                        next[index + 2] = source[sampleIndex + 2];
                        next[index + 3] = source[sampleIndex + 3];
                    }
                }
            }
        }

        imageData.data.set(next);
        ctx.putImageData(imageData, 0, 0);
    }

    exportToUint32Array(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        return new Uint32Array(imageData.data.buffer.slice(0));
    }

    packColor(r, g, b) {
        return DEFAULT_ALPHA | (clampChannel(b) << 16) | (clampChannel(g) << 8) | clampChannel(r);
    }
}

