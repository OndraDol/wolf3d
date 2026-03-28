# CLAUDE.md — Instrukce pro Claude Code

## Projekt

**Wolf3D Web Remake** — webový remake Wolfenstein 3D (id Software, 1992) čistě v JavaScriptu a HTML5 Canvas.

### Klíčová podmínka

Veškerá grafika, textury, sprity a audio jsou generovány kódem.
Žádné externí obrázky, spritesheety, textury, audio soubory ani base64 assety.

## Tech Stack

- Vanilla JavaScript — ES modules (`import`/`export`)
- HTML5 Canvas 2D — rendering přes ImageData + Uint32Array
- Web Audio API — syntéza zvuků
- Žádný bundler
- Žádné knihovny
- Čistý statický web

## Adresářová struktura

```
src/
├── engine/      ← raycasting, kamera, kolize, hlavní smyčka
├── renderer/    ← drawWalls, drawSprites, HUD, screen buffer
├── game/        ← herní logika, levely, weapon flow
├── ai/          ← enemy AI
├── audio/       ← Web Audio syntéza
├── textures/    ← Canvas 2D wall a door paintery
└── sprites/     ← Canvas 2D sprite a weapon paintery
```

## Referenční materiály

- `ARCHITECTURE.md` — technické detaily, tile registry, sprite plans
- `TASKS.md` — aktuální task list a závislosti
- `TIMELINE.md` — sprinty a milestone plán

## Konvence

- ES modules, žádné globální proměnné
- Žádné externí assety
- Commit po funkční změně, anglický commit message
- Zachovej browser-only setup bez bundleru

## Grafický přístup — Canvas 2D Painting

Všechny textury a sprity jsou malovány pomocí Canvas 2D API na offscreen canvas.
Žádné externí soubory, žádné base64 obrázky, žádné hardcoded pixel arrays.

Každá textura nebo sprite má vlastní Painter třídu s metodou `paint(ctx, w, h)`.

Při implementaci nového Painteru:
1. Podívej se na referenci originálu a na popis v `ARCHITECTURE.md`
2. Rozlož obraz na vrstvy: base fill → hlavní tvary → detaily → noise/AO
3. Implementuj vrstvu po vrstvě
4. Používej helper metody z base class (`addNoise`, `addAO`, `jitterColor`, `drawBrick`, ...)
5. Testuj v debug view
6. Iteruj dokud výsledek vizuálně neodpovídá cíli

Priorita při malování:
- Silueta a proporce > barvy > detaily > noise
- Originalita vzhledu > pixel-perfect kopie
- Čitelnost na 64×64 > realismus
