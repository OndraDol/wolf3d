/**
 * Procedurální generátor textur stěn.
 *
 * Klíčová architektonická část projektu — nahrazuje originální bitmapy.
 * Každý typ stěny (1–63) má odpovídající generátor, který vytvoří
 * ImageData texuru z matematických vzorů a barev.
 *
 * Textury se generují jednou při startu a cachují.
 *
 * Velikost textur: 64×64 (jako originál).
 */

const TEX_SIZE = 64;

/**
 * Cache vygenerovaných textur.
 * Klíč = tile type, hodnota = Uint32Array (TEX_SIZE × TEX_SIZE pixelů, ABGR)
 */
const textureCache = new Map();

/**
 * Vygeneruj nebo vrať cachovanou texturu pro daný tile type.
 * @param {number} tileType
 * @returns {Uint32Array}
 */
export function getTexture(tileType) {
    if (textureCache.has(tileType)) return textureCache.get(tileType);

    const pixels = new Uint32Array(TEX_SIZE * TEX_SIZE);
    generateTexture(tileType, pixels);
    textureCache.set(tileType, pixels);
    return pixels;
}

/**
 * Generuj texturu do pixel bufferu.
 * Bude rozšířeno o konkrétní vzory ve Fázi 2.
 */
function generateTexture(tileType, pixels) {
    // Placeholder — jednobarevné stěny s jemným vzorem
    const colors = [
        null,                        // 0 = prázdno
        packColor(128, 0, 0),        // 1 = červené cihly
        packColor(100, 100, 100),    // 2 = šedý kámen
        packColor(100, 70, 30),      // 3 = dřevo
    ];

    const baseColor = colors[tileType] || packColor(200, 200, 200);

    for (let y = 0; y < TEX_SIZE; y++) {
        for (let x = 0; x < TEX_SIZE; x++) {
            pixels[y * TEX_SIZE + x] = baseColor;
        }
    }
}

/** ABGR packing (little-endian) */
function packColor(r, g, b) {
    return 0xFF000000 | (b << 16) | (g << 8) | r;
}

export { TEX_SIZE };
