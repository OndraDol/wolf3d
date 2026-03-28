# Wolf3D — Code-Only Web Remake

> 🚧 **Work in Progress**

Webový remake **Wolfenstein 3D** (id Software, 1992) s jednou unikátní podmínkou:
**veškerá grafika je generována čistě kódem** — žádné externí obrázky, textury,
spritesheets ani audio soubory.

Stěny, sprity, HUD i first-person zbraně jsou malované přes **Canvas 2D**
na offscreen canvasy a cachované jako `Uint32Array`.
Zvuky jsou syntetizovány přes Web Audio API.

## Proč je to unikátní

Existuje mnoho webových portů Wolf3D, ale všechny používají originální grafické
assety (textury, sprity). Toto je **první čistě kódová verze** — každý pixel
na obrazovce pochází z matematického výpočtu, ne z bitmapového souboru.

## Tech Stack

- Vanilla JavaScript (ES modules)
- HTML5 Canvas 2D (ImageData + Uint32Array rendering)
- Web Audio API (syntéza zvuků)
- Žádný bundler, žádné knihovny, žádné závislosti

## Jak spustit

```bash
# Jakýkoliv statický HTTP server, např.:
python3 -m http.server 8000

# Otevři v prohlížeči:
# http://localhost:8000
```

Nebo jednoduše otevři `index.html` přes libovolný local dev server.

## Ovládání

| Klávesa | Akce |
|---------|------|
| W / ↑ | Vpřed |
| S / ↓ | Vzad |
| A / ← | Otočit vlevo |
| D / → | Otočit vpravo |
| Q / E | Strafe vlevo/vpravo |
| Space | Použít dveře / exit / start / pokračovat |
| Ctrl / Enter / F | Střelba |
| 1 / 2 / 3 | Přepnutí zbraně |
| R / Enter | Restart po smrti / po vítězství |

## Aktuální slice

- Title/start shell a intermission flow mezi levely
- Více propojených levelů (`e1m1-skeleton` -> `e1m2-reactor` -> `e1m3-command`)
- Tři player weapons: pistol, shotgun a machinegun
- Čtyři enemy archetypy: guard, projectile-firing officer, burst-firing commander a finální boss
- Canvas 2D painted wall textures, enemy sprites, dekorace, HUD a weapon view
- Armor, treasure, food a secret cache loop v campaign levelech
- Pause/help shell, doors, locks, keys, pickups, HUD, minimapa a syntetické audio

## Struktura projektu

```
src/engine/      — raycasting engine, kamera, kolize
src/renderer/    — Canvas rendering, stěny, sprity, HUD
src/game/        — herní logika, levely, zbraně
src/ai/          — enemy AI, pathfinding
src/textures/    — Canvas 2D painted wall/door textures
src/sprites/     — Canvas 2D painted sprite pipeline
src/procedural/  — kompatibilní texture wrapper pro renderer
src/audio/       — Web Audio syntéza
```

## Licence

Tento projekt je fan remake pro vzdělávací účely.
Wolfenstein 3D je vlastnictví id Software / ZeniMax Media / Microsoft.
