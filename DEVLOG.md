# DEVLOG.md

## 2026-03-28 — Session 1: Projekt setup

### Co bylo uděláno
- Naklonované 4 referenční repozitáře (originální C kód, 3 JS implementace)
- Důkladně prostudován referenční kód — všechny čtyři repozitáře
- Vytvořena adresářová struktura projektu
- Napsán scaffold: index.html, 15 ES modulů, všechny řídící dokumenty
- DDA raycaster je funkční (zatím bez vykreslování stěn)

### Klíčové poznatky z referenčního kódu

**Originální Wolf3D (C):**
- DDA raycasting je elegantně jednoduchý — jde o stepping po grid čarách, ne o sampling podél paprsku
- Fixed-point 16.16 aritmetika je všude — v JS ji nahradíme float, je to jednodušší a dostatečně přesné
- AI nepřátel je překvapivě primitivní — greedy pathfinding (žádný A*), jednoduché stavy (stand/patrol/chase/attack), ale efektivní díky level designu
- Area connectivity systém je klíčový — zvuk/detekce se šíří přes otevřené dveře, ne skrz stěny
- Mapy 64×64 s tile kódováním: stěny 1–63, dveře 64+, objekty/spawny na druhé vrstvě

**Seidelin (wolf3d-html5):**
- Kompletní port, ale DOM-based rendering (div slices s background-image) — pro nás nepoužitelné
- Zajímavá struktura AI kódu, dobře čitelná reimplementace originálního state machine
- Vyžaduje originální VSWAP.WL6 soubory — přesně to, co my nahrazujeme

**vpoupet (wolfenstein):**
- Nejčistší architektura — Canvas ImageData + Uint32Array, přesně co budeme dělat
- Funkcionální styl (globals + funkce), my půjdeme lehce objektovější (třídy/moduly)
- Frakcionální zbytek tracking při DDA je elegantní optimalizace

**Lim (html5-raycast):**
- Nejlepší educational kód — jasný, komentovaný, srozumitelný
- Pixel-level rendering bez jakýchkoliv dependencies
- Floor/ceiling projection s perspektivní korekcí — budeme potřebovat

### Architektonická rozhodnutí

1. **ImageData + Uint32Array** místo Canvas 2D API — vpoupetův přístup, řádově rychlejší pro pixel ops
2. **~15 ES modulů** — kompromis mezi vpoupetovými 5 a Seidelinovými 30
3. **Float math** místo fixed-point — JS to zvládne, kód je čitelnější
4. **Procedurální textury do cache** — jednou vygenerovat, pak jen lookup. 64×64 Uint32Array per type
5. **Billboard geometrie** pro nepřátele — obdélníky/trojúhelníky/kruhy kreslené do pixel bufferu
6. **Greedy pathfinding** (jako originál) — A* je overkill pro Wolf3D level design

### Odchylky od původního plánu

Žádné zásadní odchylky. Struktura odpovídá plánu, jen jsem přidal `collision.js`
jako separátní modul (v plánu byla kolize přímo v kameře — tam zůstává pro
základní player collision, ale modul je připravený pro rozšíření na enemy kolize).

Raycaster je napsán kompletně (ne jen scaffold) — DDA algoritmus je hotový
a funkční, jen zatím chybí vykreslování stěn (to je další krok).

### Co je next
- Vykreslování stěn z RayHit dat (barevné sloupce → texturované sloupce)
- Procedurální textury (generátor cihlového/kamenného vzoru)
- Minimap pro debugging
