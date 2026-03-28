# CODEX.md — Instrukce pro ChatGPT Codex

## Projekt

**Wolf3D Web Remake** — webový remake Wolfenstein 3D čistě v JavaScriptu a HTML5 Canvas.

### Klíčová podmínka

**Veškerá grafika, textury, sprity a audio jsou generovány kódem.**
Žádné externí obrázky, spritesheets, textury, audio soubory.

## Tech Stack

- Vanilla JavaScript — ES modules
- HTML5 Canvas 2D — rendering přes ImageData + Uint32Array
- Web Audio API — syntéza zvuků
- Žádný bundler, žádné knihovny

## Adresářová struktura

```
src/engine/      — raycasting, kamera, kolize, hlavní smyčka
src/renderer/    — Canvas pixel rendering, stěny, sprity, HUD
src/game/        — herní logika, levely, zbraně
src/ai/          — enemy AI, pathfinding
src/procedural/  — generátor textur a geometrie
src/audio/       — Web Audio syntéza
codex/experiments/ — Codex experimenty (tvůj workspace)
```

## Pravidla pro Codex

### Kde pracuješ
Codex pracuje v `codex/experiments/`. Hotové a otestované části navrhni
přesunout do `src/` v DEVLOG.md.

### Co NESMÍŠ měnit bez konzultace
- `src/` — hlavní kód projektu (spravuje Claude)
- `CLAUDE.md` — instrukce pro Claude
- Cokoliv mimo `codex/` a `DEVLOG.md`

### Jak reportovat
Výsledky zapisuj do `DEVLOG.md` jako nový záznam s datem.
Zaznamenej co jsi implementoval, co funguje, co ne.

### Jak číst referenční materiály
Referenční repozitáře jsou v `reference/` (gitignored, necommitují se):
- `reference/wolf3d-original/WOLFSRC/` — originální C kód
- `reference/wolf3d-html5/js/` — Seidelin HTML5 port
- `reference/wolf3d-vpoupet/js/` — vpoupet JS přepis
- `reference/html5-raycast/` — Lim Canvas raycaster

### Konvence
- ES modules (`import`/`export`)
- Komentáře v češtině jsou OK
- Žádné externí soubory — vše v kódu
- Nikdy nepřidávej obrázky, textury, audio soubory

## Aktuální stav

Viz `PROGRESS.md` pro kompletní checklist a `CLAUDE.md` sekci "Aktuální stav".

Setup je hotový. Základní DDA raycaster implementován. Další krok: vykreslování stěn.
