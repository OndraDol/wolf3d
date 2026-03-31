/**
 * Tiny Web Audio synth helpers for gameplay feedback.
 */

let audioCtx = null;

export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }

    return audioCtx;
}

function createTone(type, startFrequency, endFrequency, duration, gainValue = 0.08) {
    const ctx = initAudio();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFrequency, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
}

function createPulseSequence(notes, type = 'square', gainValue = 0.06) {
    const ctx = initAudio();
    const startTime = ctx.currentTime;

    notes.forEach((note, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = startTime + index * note.length;
        const noteEnd = noteStart + note.length;

        osc.type = type;
        osc.frequency.setValueAtTime(note.frequency, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(gainValue, noteStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteEnd + 0.01);
    });
}

export function playSound(name) {
    try {
        switch (name) {
            case 'slash-knife':
                createPulseSequence([
                    { frequency: 460, length: 0.02 },
                    { frequency: 220, length: 0.035 },
                ], 'sawtooth', 0.045);
                break;
            case 'shot-pistol':
                createTone('square', 840, 180, 0.08, 0.11);
                break;
            case 'shot-shotgun':
                createPulseSequence([
                    { frequency: 180, length: 0.045 },
                    { frequency: 120, length: 0.055 },
                    { frequency: 82, length: 0.08 },
                ], 'square', 0.12);
                break;
            case 'shot-machinegun':
                createPulseSequence([
                    { frequency: 520, length: 0.025 },
                    { frequency: 360, length: 0.03 },
                ], 'square', 0.085);
                break;
            case 'shot-chaingun':
                createPulseSequence([
                    { frequency: 620, length: 0.02 },
                    { frequency: 430, length: 0.02 },
                    { frequency: 300, length: 0.025 },
                ], 'square', 0.08);
                break;
            case 'dry-fire':
                createTone('square', 180, 120, 0.05, 0.04);
                break;
            case 'door':
                createTone('triangle', 220, 150, 0.18, 0.05);
                break;
            case 'locked':
                createTone('sawtooth', 140, 90, 0.09, 0.05);
                break;
            case 'pickup':
                createTone('triangle', 620, 1180, 0.12, 0.06);
                break;
            case 'treasure':
                createPulseSequence([
                    { frequency: 784, length: 0.06 },
                    { frequency: 988, length: 0.06 },
                    { frequency: 1175, length: 0.1 },
                ], 'triangle', 0.05);
                break;
            case 'secret':
                createPulseSequence([
                    { frequency: 262, length: 0.08 },
                    { frequency: 330, length: 0.08 },
                    { frequency: 440, length: 0.08 },
                    { frequency: 523, length: 0.14 },
                ], 'square', 0.045);
                break;
            case 'enemy-hit':
                createTone('sawtooth', 320, 210, 0.1, 0.05);
                break;
            case 'enemy-death':
                createTone('square', 240, 80, 0.22, 0.07);
                break;
            case 'enemy-shot':
                createTone('sawtooth', 540, 240, 0.12, 0.045);
                break;
            case 'weapon-pickup':
                createPulseSequence([
                    { frequency: 330, length: 0.08 },
                    { frequency: 494, length: 0.08 },
                    { frequency: 659, length: 0.14 },
                ], 'triangle', 0.05);
                break;
            case 'weapon-switch':
                createTone('triangle', 340, 460, 0.05, 0.04);
                break;
            case 'player-hit':
                createTone('sawtooth', 180, 70, 0.15, 0.08);
                break;
            case 'level-complete':
                createPulseSequence([
                    { frequency: 392, length: 0.12 },
                    { frequency: 523, length: 0.12 },
                    { frequency: 659, length: 0.2 },
                ], 'triangle', 0.05);
                break;
            case 'start-game':
                createPulseSequence([
                    { frequency: 196, length: 0.12 },
                    { frequency: 262, length: 0.12 },
                    { frequency: 392, length: 0.2 },
                ], 'triangle', 0.05);
                break;
            default:
                break;
        }
    } catch {
        // Audio is optional feedback. Ignore browser/audio init failures.
    }
}

/* ─── Background Music ───────────────────────────────────────── */

let musicOscillators = [];
let musicPlaying = false;
let musicInterval = null;

// Simple E minor loop inspired by Wolf3D's marching theme
const MUSIC_NOTES = [
    164.81, 196.00, 246.94, 196.00,  // E3 G3 B3 G3
    164.81, 220.00, 261.63, 220.00,  // E3 A3 C4 A3
    146.83, 196.00, 246.94, 196.00,  // D3 G3 B3 G3
    164.81, 196.00, 164.81, 130.81,  // E3 G3 E3 C3
];

const BASS_NOTES = [
    82.41, 82.41, 82.41, 82.41,     // E2
    110.00, 110.00, 110.00, 110.00,  // A2
    73.42, 73.42, 73.42, 73.42,     // D2
    82.41, 82.41, 65.41, 65.41,     // E2 C2
];

export function startMusic() {
    if (musicPlaying || !audioCtx) return;
    musicPlaying = true;

    let noteIndex = 0;
    const bpm = 140;
    const noteLength = 60 / bpm;

    musicInterval = setInterval(() => {
        if (!audioCtx || audioCtx.state !== 'running') return;

        const now = audioCtx.currentTime;

        // Melody
        const melOsc = audioCtx.createOscillator();
        const melGain = audioCtx.createGain();
        melOsc.type = 'square';
        melOsc.frequency.setValueAtTime(MUSIC_NOTES[noteIndex % MUSIC_NOTES.length], now);
        melGain.gain.setValueAtTime(0.03, now);
        melGain.gain.exponentialRampToValueAtTime(0.001, now + noteLength * 0.9);
        melOsc.connect(melGain);
        melGain.connect(audioCtx.destination);
        melOsc.start(now);
        melOsc.stop(now + noteLength);

        // Bass
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(BASS_NOTES[noteIndex % BASS_NOTES.length], now);
        bassGain.gain.setValueAtTime(0.04, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + noteLength * 0.9);
        bassOsc.connect(bassGain);
        bassGain.connect(audioCtx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + noteLength);

        noteIndex++;
    }, noteLength * 1000);
}

export function stopMusic() {
    musicPlaying = false;
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}
