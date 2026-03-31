/**
 * Správa Canvas — ImageData buffer, Uint32Array pro rychlé pixel ops.
 *
 * Architektura:
 * - Interní rozlišení (SCREEN_WIDTH × SCREEN_HEIGHT) zůstává konstantní
 * - Canvas se škáluje přes CSS na celou obrazovku (image-rendering: pixelated)
 * - Kreslíme do ImageData, pak putImageData() jednou za frame
 */

export class Screen {
    constructor(canvas, width, height, viewportHeight = height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.viewportHeight = viewportHeight;

        canvas.width = width;
        canvas.height = height;

        this.ctx = canvas.getContext('2d');
        this.imageData = this.ctx.createImageData(width, height);

        // Uint32Array view — zápis celého RGBA pixelu najednou
        this.pixels = new Uint32Array(this.imageData.data.buffer);

        // Barvy pro strop a podlahu (ABGR formát kvůli little-endian)
        this.ceilingColor = 0xFF383838; // dark gray ceiling
        this.floorColor = 0xFF555555;   // gray floor
    }

    /** Vyčisti buffer — strop nahoře, podlaha dole, status bar area black */
    clear() {
        const half = Math.floor(this.viewportHeight / 2);
        const w = this.width;
        const pixels = this.pixels;

        for (let y = 0; y < half; y++) {
            const offset = y * w;
            for (let x = 0; x < w; x++) {
                pixels[offset + x] = this.ceilingColor;
            }
        }
        for (let y = half; y < this.viewportHeight; y++) {
            const offset = y * w;
            for (let x = 0; x < w; x++) {
                pixels[offset + x] = this.floorColor;
            }
        }
        // Status bar area — filled black (HUD draws over this via ctx)
        for (let y = this.viewportHeight; y < this.height; y++) {
            const offset = y * w;
            for (let x = 0; x < w; x++) {
                pixels[offset + x] = 0xFF000000;
            }
        }
    }

    /** Nakresli jeden pixel (ABGR) */
    setPixel(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.pixels[y * this.width + x] = color;
        }
    }

    /** Nakresli vertikální sloupec jednou barvou */
    drawColumn(x, yStart, yEnd, color) {
        if (x < 0 || x >= this.width) return;
        const start = Math.max(0, Math.floor(yStart));
        const end = Math.min(this.height - 1, Math.floor(yEnd));
        for (let y = start; y <= end; y++) {
            this.pixels[y * this.width + x] = color;
        }
    }

    /** Pošli ImageData buffer na canvas */
    present() {
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    /** Přizpůsob canvas velikosti okna (zachovej aspect ratio) */
    resize() {
        const windowRatio = window.innerWidth / window.innerHeight;
        const gameRatio = this.width / this.height;

        if (windowRatio > gameRatio) {
            this.canvas.style.height = '100vh';
            this.canvas.style.width = `${window.innerHeight * gameRatio}px`;
        } else {
            this.canvas.style.width = '100vw';
            this.canvas.style.height = `${window.innerWidth / gameRatio}px`;
        }

        this.canvas.style.margin = 'auto';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.bottom = '0';
        this.canvas.style.left = '0';
        this.canvas.style.right = '0';
    }

    /** Pomocná funkce — vytvoř ABGR barvu z RGB */
    static rgb(r, g, b) {
        return 0xFF000000 | (b << 16) | (g << 8) | r;
    }
}
