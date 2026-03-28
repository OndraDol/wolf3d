# COMPLETE THE WOLF3D GAME — Full Episode Prompt for Codex

You are finishing a Wolf3D web remake. The engine, renderer, AI, 5 weapons, 5 enemy types, HUD, and full game flow are working with 4 levels (test-lab tutorial + e1m1/e1m2/e1m3). Your job is to turn this into a **complete 10-floor episode** with all missing features. Do NOT stop until EVERY task is done, committed, and pushed to `main`.

## RULES — Read These First

1. **Work on `main` branch.** `git checkout main && git pull origin main` before starting.
2. **Do NOT stop after one task.** Complete ALL tasks in sequence. After each task group, commit and move to the next immediately.
3. **No external assets.** All graphics are Canvas 2D painted. All audio is Web Audio synthesized. No images, no base64, no audio files.
4. **ES modules only.** No bundler, no libraries, no globals.
5. **Read existing code before writing.** The codebase has conventions — follow them exactly.
6. **Push to `main`** when ALL tasks are done: `git push -u origin main`

---

## TASK 1: Add 6 New Levels (e1m4 through e1m9)

The game currently has 4 levels: `test-lab` → `e1m1-skeleton` → `e1m2-reactor` → `e1m3-command`. The original Wolf3D Episode 1 has 9 floors + a secret floor. Add floors 4–9 to create a full episode.

### How levels work

In `src/game/level.js`, each level is defined in the `LEVELS` array with this structure:

```javascript
{
    id: 'e1m4-storage',       // unique ID
    name: 'Storage Bay',      // display name
    episode: 1,
    floor: 4,                 // floor number
    nextLevelId: 'e1m5-xxx',  // chain to next level
    briefing: '...',          // shown on title screen
    layout: `...`,            // ASCII map
    playerStart: { x, y, angle },
    entities: [...],          // enemies
    pickups: [...],           // items
    props: [...],             // decorations
    secrets: [...],           // secret zones
    exit: { x, y, facing, requireKill: null },
}
```

**Tile symbols** (for layout ASCII):
- `.` = floor, `#` = brick, `%` = blue stone, `+` = wood, `&` = gray stone
- `=` = metal panels, `!` = ornament, `E` = elevator exit, `|` = prison bars
- `D` = door, `G` = gold-locked door, `S` = silver-locked door
- `>`, `<`, `^`, `v` = player start (facing direction)

**Entity types**: `guard`, `officer`, `dog`, `commander`, `boss`
**Pickup types**: `ammo`, `medkit`, `armor`, `food`, `shotgun`, `machinegun`, `chaingun`, `knife`, `treasure`, `gold-key`, `silver-key`
**Prop types**: `barrel`, `table`, `lamp`, `skeleton`, `plant`, `armor`, `blood`, `column`, `pot`

### Level requirements

Design each level following these guidelines:
- **Maps are 18×N or N×18** (max width/height ~20 tiles to fit minimap)
- Each level should feel different (mix wall types, corridor widths, room sizes)
- Place enemies thoughtfully — mix types, use patrol routes
- Every level needs at least 1 key + 1 locked door
- Every level needs at least 1 secret zone
- Every level needs pickups: ammo, health, at least 1 treasure
- Place decorative props for atmosphere
- The exit elevator `E` should be behind a locked door or in a hard-to-reach area
- Use ALL 5 enemy types across the episode — not just guards

### Level themes and progression

| Level | ID | Theme | Key feature | Enemies |
|-------|-----|-------|-------------|---------|
| Floor 4 | `e1m4-storage` | Storage Bay — crates, tight corridors | Silver key maze | guards, dogs, officer |
| Floor 5 | `e1m5-prison` | Prison Block — prison bars, cells | Prison bars `\|` used heavily | guards, dogs, officers |
| Floor 6 | `e1m6-armory` | Armory — metal panels, weapon cache | Chaingun reward, heavy combat | officers, commander, guards |
| Floor 7 | `e1m7-laboratory` | Research Lab — blue stone, open areas | Open arena fights | all types, multiple dogs |
| Floor 8 | `e1m8-bunker` | Deep Bunker — gray stone, fortress | Two keys required | commanders, officers, guards |
| Floor 9 | `e1m9-tower` | Command Tower — ornament walls, boss | **Final boss floor** | commander, officers, boss |

### Chain levels together

Update the `nextLevelId` chain:
- `e1m3-command` → `e1m4-storage` (change from `null`)
- `e1m4-storage` → `e1m5-prison`
- `e1m5-prison` → `e1m6-armory`
- `e1m6-armory` → `e1m7-laboratory`
- `e1m7-laboratory` → `e1m8-bunker`
- `e1m8-bunker` → `e1m9-tower`
- `e1m9-tower` → `null` (game end, triggers victory)

### IMPORTANT: Remove boss requirement from e1m3

`e1m3-command` currently has `requireKill: 'boss'` and contains the boss enemy. Since e1m3 is no longer the final level, **remove the boss entity and the requireKill constraint from e1m3**. Move the boss to `e1m9-tower` instead. The e1m9 exit should have `requireKill: 'boss'`.

### Level design tips

- Use `#` for outer walls, mix inner walls with `%`, `+`, `&`, `=`, `!`
- Create loops — don't make pure linear corridors
- Place `D` doors between areas (they need wall tiles on both sides perpendicular to the door axis)
- Place `G`/`S` locked doors to gate progression
- Dogs work best in open corridors where they can charge
- Officers need space to retreat (retreatRange: 2.8)
- Commanders are mini-bosses — use sparingly (1-2 per level)
- Place keys behind combat encounters
- Secrets should be off the main path but near suspicious wall patterns

### Example level (use as template for size/complexity)

Look at `e1m2-reactor` in the code — it's a good reference for map size (18×12), entity count (5), pickup count (10), prop count (4), and secret count (2).

**Each new level should have:**
- 5–8 enemies
- 6–12 pickups
- 3–6 props
- 1–2 secrets
- 1–2 locked doors
- Clear path from start to exit

### Commit after this task
```
feat: add 6 new levels completing episode 1 (floors 4-9)
```

---

## TASK 2: Add Distance Fog to Sprites

Walls already have fog (see `applyFog()` in `src/renderer/walls.js`). Sprites don't — enemies at distance render at full brightness which looks wrong.

### 2a. Add fog to sprite rendering in `src/renderer/sprites.js`

In the `blitSprite()` function, after reading the source pixel color (line ~56: `const color = spritePixels[spriteRowOffset + sourceX]`), apply fog based on `spriteDepth` before writing to the screen buffer.

Add a fog function at the top of `sprites.js` (copy the constants and logic from `walls.js`):

```javascript
const FOG_NEAR = 3;
const FOG_FAR = 10;

function applyFog(color, distance) {
    const fogAmount = Math.max(0, Math.min(1, (distance - FOG_NEAR) / (FOG_FAR - FOG_NEAR)));
    if (fogAmount <= 0) return color;
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
```

Then in `blitSprite`, change:
```javascript
pixels[rowOffset + px] = color;
```
to:
```javascript
pixels[rowOffset + px] = applyFog(color, spriteDepth);
```

### 2b. Also apply fog to projectiles

In `drawProjectile()`, apply fog to `glowColor` and `coreColor` using the same function.

### Commit after this task
```
feat: add distance fog to sprites and projectiles
```

---

## TASK 3: Add Ambient Background Music

The game has no music. Add a simple synthesized ambient loop using Web Audio API.

### 3a. Create `src/audio/music.js`

Create a music module that generates a looping ambient track using Web Audio oscillators and gain nodes. The music should:

- Use the shared AudioContext from `synth.js` (export it if not already exported)
- Create a low drone/pad sound (sine wave, ~55-65 Hz) with slow amplitude modulation
- Layer a second oscillator for subtle harmonic tension (sine/triangle, ~82-98 Hz)
- Add a very quiet high shimmer (triangle wave, ~440 Hz, nearly silent, slow tremolo)
- Master volume should be LOW (gain ~0.06-0.08) — this is background atmosphere, not foreground
- Provide `startMusic()` and `stopMusic()` functions
- Music should loop seamlessly

Example approach:
```javascript
let musicNodes = null;

export function startMusic(audioCtx) {
    if (musicNodes) return;
    const master = audioCtx.createGain();
    master.gain.value = 0.07;
    master.connect(audioCtx.destination);

    // Low drone
    const drone = audioCtx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 58;
    const droneGain = audioCtx.createGain();
    droneGain.gain.value = 0.6;
    drone.connect(droneGain).connect(master);
    drone.start();

    // Slow LFO on drone
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain).connect(droneGain.gain);
    lfo.start();

    // Tension harmonic
    const tension = audioCtx.createOscillator();
    tension.type = 'triangle';
    tension.frequency.value = 87;
    const tensionGain = audioCtx.createGain();
    tensionGain.gain.value = 0.25;
    tension.connect(tensionGain).connect(master);
    tension.start();

    // High shimmer
    const shimmer = audioCtx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.value = 440;
    const shimmerGain = audioCtx.createGain();
    shimmerGain.gain.value = 0.04;
    shimmer.connect(shimmerGain).connect(master);
    shimmer.start();

    musicNodes = { master, drone, droneGain, lfo, lfoGain, tension, tensionGain, shimmer, shimmerGain };
}

export function stopMusic() {
    if (!musicNodes) return;
    Object.values(musicNodes).forEach(node => {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
    });
    musicNodes = null;
}
```

### 3b. Wire music into the game loop

In `src/engine/main.js`:
- Import `startMusic` and `stopMusic` from `../audio/music.js`
- Call `startMusic(audioCtx)` when game transitions from `title` to `playing` (in `startRun()` or equivalent)
- Call `stopMusic()` on death and victory
- Restart music when continuing from intermission to next level

### 3c. Export AudioContext from synth.js

If `synth.js` doesn't already export the AudioContext, export it so `music.js` can use the same one. Check how `synth.js` creates its context and ensure `music.js` shares it. Do NOT create a second AudioContext.

### Commit after this task
```
feat: add synthesized ambient background music
```

---

## TASK 4: Add Difficulty Selection

### 4a. Add difficulty state

In `src/game/state.js`, add a `difficulty` property to game state. Define 3 difficulty levels:

```javascript
export const DIFFICULTY = {
    easy:   { label: 'Can I play, Daddy?', enemyHealthScale: 0.6, enemyDamageScale: 0.5, ammoScale: 1.5 },
    normal: { label: 'Bring \'em on!',     enemyHealthScale: 1.0, enemyDamageScale: 1.0, ammoScale: 1.0 },
    hard:   { label: 'I am Death incarnate!', enemyHealthScale: 1.4, enemyDamageScale: 1.5, ammoScale: 0.7 },
};
```

Add `this.difficulty = 'normal'` to `resetPlayerState()`.

### 4b. Apply difficulty scaling

In `src/ai/enemy.js`, when creating an enemy, scale `health` by `enemyHealthScale`. Read difficulty from gameState.

In `src/engine/main.js`, when enemy deals damage to player, scale by `enemyDamageScale`.

In pickup collection, scale ammo amounts by `ammoScale` (round to nearest integer, minimum 1).

### 4c. Add difficulty selection to title screen

In `src/renderer/hud.js`, modify `drawTitleOverlay()`:
- Show 3 difficulty options below the briefing text
- Highlight the currently selected difficulty
- Use Up/Down arrow keys (or W/S) to navigate
- Enter/Space confirms selection and starts the game

In `src/engine/main.js`, handle Up/Down input on title screen to cycle difficulty before game starts. Store the selection in gameState.

### Commit after this task
```
feat: add difficulty selection with 3 levels
```

---

## TASK 5: Add Fullscreen Toggle

### 5a. Add fullscreen handler

In `src/engine/main.js`, add a keyboard handler for `F11` or `KeyP` (for fullscreen toggle):

```javascript
if (input.consumePressed('F11') || input.consumePressed('Backquote')) {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}
```

### 5b. Show hint in controls

In `drawTitleOverlay()` or `drawHelpOverlay()` in `hud.js`, add a line mentioning the fullscreen key.

### Commit after this task
```
feat: add fullscreen toggle
```

---

## TASK 6: Add CrackedStonePainter (Tile 9)

Currently tile 8 is PrisonBarsPainter. Add a new CrackedStonePainter as tile 9.

### 6a. Create `src/textures/walls/CrackedStonePainter.js`

Follow the GrayStonePainter style but add cracked lines. The texture should be:
- Base: gray stone blocks (similar to tile 4 but darker, #505050 range)
- Add 2-3 dark crack lines running diagonally/vertically across the surface
- Add subtle noise
- Apply ambient occlusion

Use the existing `TexturePainter` base class helpers (`addNoise`, `addAO`, `jitterColor`, etc.).

### 6b. Register in TextureGenerator

In `src/textures/TextureGenerator.js`:
- Import `CrackedStonePainter`
- Add to registry: `[9, { label: 'Tile 9 — Cracked Stone', painter: new CrackedStonePainter(), group: 'walls' }]`

### 6c. Add to TILE_SYMBOLS in `src/game/level.js`

Add: `'~': 9` — tilde suggests cracked/broken surface.

### 6d. Use in levels

Use `~` tiles in at least 2 of the new levels (e.g., `e1m7-laboratory` and `e1m8-bunker`).

### Commit after this task
```
feat: add cracked stone texture (tile 9)
```

---

## TASK 7: Update TASKS.md

Go through TASKS.md and mark ALL completed tasks. After your changes:
- CrackedStonePainter → `[x]`
- Distance fog → `[x]`
- SecretWallPainter → leave as `[ ]` if not implemented
- Add new entries for: music, difficulty selection, fullscreen, 6 new levels

### Commit after this task
```
docs: update TASKS.md with completed items
```

---

## TASK 8: Final Smoke Test & Polish

After all changes, verify:

1. **Game loads** without console errors
2. **Title screen** shows difficulty selection
3. **All difficulty levels** apply (enemies easier/harder)
4. **All 9 episode floors + tutorial** are playable in sequence
5. **Level chain works**: e1m1 → e1m2 → ... → e1m9 → victory
6. **e1m3 no longer has boss** — boss is only on e1m9
7. **e1m9 requires boss kill** to exit
8. **All 5 weapons** work (knife, pistol, shotgun, machinegun, chaingun)
9. **All 5 enemy types** appear across levels
10. **Distance fog** applies to sprites and projectiles
11. **Music plays** during gameplay, stops on death/victory
12. **Fullscreen toggle** works
13. **Prison bars** and **cracked stone** tiles render correctly
14. **Intermission screen** shows correct stats after each floor
15. **Death → restart floor** works
16. **Victory screen** shows after e1m9 boss is killed
17. **HUD** displays correctly with all weapon slots

Fix ANY issues found before proceeding.

---

## TASK 9: Final Commit and Push

After all tasks are verified:

```bash
git add -A
git commit -m "feat: complete Wolf3D Episode 1 — 10 floors, music, difficulty, fog, cracked stone"
git push -u origin main
```

If there were intermediate commits from previous tasks, that's fine. Just make sure everything is pushed to `main`.

---

## IMPORTANT REMINDERS

- **All painters already exist** for enemies, weapons, pickups, decorations, and UI — do NOT create new sprite painters
- **Follow exact code style** of existing levels, weapons, enemies in the codebase
- **ASCII level layouts must be rectangular** — every row same length, surrounded by wall tiles
- **Doors need walls on perpendicular sides** — `D` between two walls (e.g., `#D#` horizontally or walls above/below vertically)
- **Player start symbol** (`>`, `<`, `^`, `v`) replaces a `.` floor tile in the layout
- **Entity positions** use float coordinates (e.g., `3.5, 7.5` = center of tile 3,7)
- **Keep Web Audio synthesis** — no audio files, no base64
- **Keep ES modules** — no bundler, no libraries
- **Run through ALL 9 tasks.** Do NOT stop after task 1 or task 2.
- **The project is done when task 9 is pushed to `main`.**
