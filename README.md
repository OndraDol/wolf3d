# Wolf3D — Code-Only Web Remake

> 🚧 **Work in Progress**

Webový remake **Wolfenstein 3D** (id Software, 1992) s jednou unikátní podmínkou:
**veškerá grafika je generována čistě kódem** — žádné externí obrázky, textury,
spritesheets ani audio soubory.

Stěny jsou procedurálně generované vzory z matematiky a barev.
Nepřátelé jsou geometrické tvary s kódovými animacemi.
HUD, zbraně a menu jsou Canvas 2D primitiva.
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

## Struktura projektu

```
src/engine/      — raycasting engine, kamera, kolize
src/renderer/    — Canvas rendering, stěny, sprity, HUD
src/game/        — herní logika, levely, zbraně
src/ai/          — enemy AI, pathfinding
src/procedural/  — generátor textur a geometrie
src/audio/       — Web Audio syntéza
```

## Licence

Tento projekt je fan remake pro vzdělávací účely.
Wolfenstein 3D je vlastnictví id Software / ZeniMax Media / Microsoft.
