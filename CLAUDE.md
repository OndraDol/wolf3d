# CLAUDE.md — Instrukce pro Claude Code

## Projekt

**Wolf3D Web Remake** — webový remake Wolfenstein 3D (id Software, 1992) čistě v JavaScriptu a HTML5 Canvas.

### Klíčová podmínka

**Veškerá grafika, textury, sprity a audio jsou generovány kódem.**
Žádné externí obrázky, spritesheets, textury, audio soubory.
Stěny = procedurálně generované vzory. Nepřátelé = geometrické tvary.
HUD = Canvas 2D primitiva. Zvuky = Web Audio API syntéza.

## Tech Stack

- **Vanilla JavaScript** — ES modules (`import`/`export`)
- **HTML5 Canvas 2D** — rendering přes ImageData + Uint32Array
- **Web Audio API** — syntéza zvuků z oscilátorů
- **Žádný bundler** — žádný webpack, vite, rollup
- **Žádné knihovny** — žádný jQuery, Three.js, Pixi.js
- **Čistý statický web** — hostováno na GitHub Pages

## Adresářová struktura

```
src/
├── engine/          ← raycasting, kamera, kolize, hlavní smyčka
│   ├── main.js      ← entry point, game loop
│   ├── raycaster.js ← DDA raycasting algoritmus
│   ├── camera.js    ← pozice hráče, pohyb, FOV
│   ├── map.js       ← datová struktura mapy (2D tile array)
│   ├── input.js     ← klávesnice
│   └── collision.js ← detekce kolizí
├── renderer/        ← Canvas pixel rendering
│   ├── screen.js    ← Canvas/ImageData/Uint32Array buffer
│   ├── walls.js     ← vykreslování stěn z raycasteru
│   ├── sprites.js   ← billboard sprite rendering
│   └── hud.js       ← HUD overlay
├── game/            ← herní logika
│   ├── state.js     ← herní stav (zdraví, munice, score)
│   └── level.js     ← definice levelů
├── ai/              ← enemy AI
│   └── enemy.js     ← stavový automat, pathfinding
├── procedural/      ← generátor textur a geometrie
│   └── textures.js  ← procedurální textury stěn
└── audio/           ← audio syntéza
    └── synth.js     ← Web Audio API generátor zvuků
```

## Referenční materiály

V `reference/` (gitignored) jsou čtyři referenční repozitáře:

- **wolf3d-original/** — originální C zdrojový kód id Software
  - `WOLFSRC/WL_DRAW.C` — DDA raycasting algoritmus
  - `WOLFSRC/WL_ACT*.C` — AI nepřátel
  - `WOLFSRC/WL_GAME.C` — herní stavy
- **wolf3d-html5/** — Seidelin HTML5 port (30 JS souborů, DOM rendering)
- **wolf3d-vpoupet/** — vpoupet čistý JS přepis (Canvas ImageData)
- **html5-raycast/** — Lim educational raycaster (pixel-level Canvas)

### Jak používat referenční kód

1. Pro raycasting: studuj `wolf3d-original/WOLFSRC/WL_DRAW.C` + `html5-raycast/`
2. Pro AI: studuj `wolf3d-original/WOLFSRC/WL_ACT2.C` + `wolf3d-html5/js/actorai.js`
3. Pro rendering: studuj `wolf3d-vpoupet/js/engine.js` (Canvas ImageData pattern)
4. Pro mapy: studuj `wolf3d-original/WOLFSRC/WL_GAME.C` (spawn kódy tile hodnot)

## Konvence

- ES modules (`import`/`export`), žádné globální proměnné
- Komentáře v češtině jsou OK
- Commit po každé funkční změně, anglický commit message
- Soubory PROGRESS.md, DEVLOG.md, CLAUDE.md updatovat průběžně
- **Žádné externí soubory** — vše v kódu

## Architektonická rozhodnutí

### Rendering pipeline
1. `Screen.clear()` — strop/podlaha
2. `Raycaster.castRays(camera)` → pole `RayHit`
3. `drawWalls(screen, rays)` — sloupce stěn z textur
4. `drawSprites(screen, camera, entities, depthBuffer)` — billboard entity
5. `drawHUD(ctx, gameState)` — overlay
6. `Screen.present()` — `putImageData()`

### Proč ImageData + Uint32Array
- Zápis jednoho pixelu = jeden assignment do Uint32Array
- 10× rychlejší než `fillRect()` per pixel
- Originál i vpoupet i Lim používají tento přístup

### Procedurální textury
- 64×64 pixelů na texturu (jako originál)
- Generují se jednou při startu do Uint32Array cache
- Tile type (1–63) → odpovídající generátor (cihly, kámen, dřevo, kov...)
- Vzory z matematiky: noise, grid patterns, gradients, hash funkce

### Enemy bez spriteů
- Billboard geometrie — vždy čelem ke kameře
- Tělo = obdélníky/trojúhelníky/kruhy složené z Canvas primitiv
- Různé typy = různé barvy a tvary
- Animace = interpolace mezi klíčovými tvary

## Aktuální stav

- [x] Adresářová struktura vytvořena
- [x] Canvas setup s FPS counter
- [x] DDA raycaster implementován (základ)
- [x] Kamera s pohybem a kolizemi
- [x] Testovací mapa 8×8
- [ ] Vykreslování stěn z raycasteru
- [ ] Procedurální textury
- [ ] Vše ostatní (viz PROGRESS.md)
