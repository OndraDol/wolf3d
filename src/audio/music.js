/**
 * Low-key ambient music loop layered from shared Web Audio oscillators.
 */

let musicNodes = null;

export function startMusic(audioCtx) {
    if (!audioCtx || musicNodes) {
        return;
    }

    const master = audioCtx.createGain();
    master.gain.value = 0.07;
    master.connect(audioCtx.destination);

    const drone = audioCtx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 58;
    const droneGain = audioCtx.createGain();
    droneGain.gain.value = 0.48;
    drone.connect(droneGain).connect(master);
    drone.start();

    const droneLfo = audioCtx.createOscillator();
    droneLfo.type = 'sine';
    droneLfo.frequency.value = 0.14;
    const droneLfoGain = audioCtx.createGain();
    droneLfoGain.gain.value = 0.16;
    droneLfo.connect(droneLfoGain).connect(droneGain.gain);
    droneLfo.start();

    const tension = audioCtx.createOscillator();
    tension.type = 'triangle';
    tension.frequency.value = 87;
    const tensionGain = audioCtx.createGain();
    tensionGain.gain.value = 0.2;
    tension.connect(tensionGain).connect(master);
    tension.start();

    const tensionLfo = audioCtx.createOscillator();
    tensionLfo.type = 'sine';
    tensionLfo.frequency.value = 0.09;
    const tensionLfoGain = audioCtx.createGain();
    tensionLfoGain.gain.value = 0.06;
    tensionLfo.connect(tensionLfoGain).connect(tensionGain.gain);
    tensionLfo.start();

    const shimmer = audioCtx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.value = 440;
    const shimmerGain = audioCtx.createGain();
    shimmerGain.gain.value = 0.02;
    shimmer.connect(shimmerGain).connect(master);
    shimmer.start();

    const shimmerLfo = audioCtx.createOscillator();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.value = 0.21;
    const shimmerLfoGain = audioCtx.createGain();
    shimmerLfoGain.gain.value = 0.012;
    shimmerLfo.connect(shimmerLfoGain).connect(shimmerGain.gain);
    shimmerLfo.start();

    musicNodes = {
        master,
        drone,
        droneGain,
        droneLfo,
        droneLfoGain,
        tension,
        tensionGain,
        tensionLfo,
        tensionLfoGain,
        shimmer,
        shimmerGain,
        shimmerLfo,
        shimmerLfoGain,
    };
}

export function stopMusic() {
    if (!musicNodes) {
        return;
    }

    Object.values(musicNodes).forEach((node) => {
        if (typeof node.stop === 'function') {
            try {
                node.stop();
            } catch {
                // Ignore repeated stop calls when tearing down optional audio.
            }
        }
        if (typeof node.disconnect === 'function') {
            node.disconnect();
        }
    });

    musicNodes = null;
}
