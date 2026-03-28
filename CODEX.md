# CODEX.md — Instrukce pro Codex

## Projekt

**Wolf3D Web Remake** — webový remake Wolfenstein 3D čistě v JavaScriptu a HTML5 Canvas.

### Klíčová podmínka

Veškerá grafika, textury, sprity a audio jsou generovány kódem.
Žádné externí obrázky, spritesheety, textury, audio soubory ani base64 assety.

## Tech Stack

- Vanilla JavaScript — ES modules
- HTML5 Canvas 2D — rendering přes ImageData + Uint32Array
- Web Audio API — syntéza zvuků
- Žádný bundler, žádné knihovny

## Adresářová struktura

```
src/engine/      — raycasting, kamera, kolize, hlavní smyčka
src/renderer/    — drawWalls, drawSprites, HUD, screen buffer
src/game/        — herní logika, levely, zbraně
src/ai/          — enemy AI, pathing, combat chování
src/audio/       — Web Audio syntéza
src/textures/    — Canvas 2D wall/door paint pipeline
src/sprites/     — Canvas 2D sprite/view-weapon paint pipeline
codex/           — workspace a experimenty pro Codex
```

## Pravidla pro Codex

- Zachovej browser-only ES modules setup bez bundleru
- Nepřidávej žádné externí assety ani build step
- Když implementuješ grafiku, preferuj nové `Painter` classy místo hardcoded pixel arrays
- Při větších změnách nejdřív čti aktuální stav repa, nepracuj z čisté teorie
- Hotové změny ověřuj v debug view nebo jednoduchým smoke testem

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

## Reference

- `ARCHITECTURE.md` — technický popis pipeline, tile registr, sprite plány
- `TASKS.md` — aktuální task list a závislosti
- `TIMELINE.md` — sprint plán
- `CLAUDE.md` — paralelní instrukce pro Claude Code
