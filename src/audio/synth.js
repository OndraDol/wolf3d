/**
 * Audio syntéza přes Web Audio API.
 * Všechny zvuky generovány z oscilátorů a noise — žádné soubory.
 *
 * Zvuky: střelba, kroky, dveře, nepřátelé, smrt, pickup.
 *
 * Bude implementováno ve Fázi 7.
 */

let audioCtx = null;

/** Lazy init audio contextu (vyžaduje user gesture) */
export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

/**
 * Přehraj syntetizovaný zvuk.
 * @param {string} name - název zvuku
 */
export function playSound(name) {
    // TODO: implementovat zvukové generátory
}
