# ARCHITECTURE.md — Technická architektura

## DDA Raycasting algoritmus

### Princip
Pro každý sloupec obrazovky (640 sloupců) vyšleme paprsek z pozice kamery
pod odpovídajícím úhlem. Paprsek prochází 2D mřížkou mapy (64×64 tiles)
a hledáme první stěnu, kterou protne.

### DDA (Digital Differential Analyzer)
Místo testování bodů podél paprsku v malých krocích (pomalé) používáme DDA:

1. Spočítáme vzdálenost k **první** vertikální a horizontální grid čáře
2. Vždy postoupíme k **bližší** grid čáře
3. Zkontrolujeme tile na druhé straně
4. Opakujeme dokud nenarazíme na stěnu

```
Paprsek ────→  │      │
               │      │
    ─ ─ ─ ─ ─ ┼ ─ ─ ─┼ ─ ─    DDA testuje průsečíky
               │  ×   │         s grid čarami, ne
    ─ ─ ─ ─ ─ ┼ ─ ×──┼ ─ ─    body podél paprsku
               │      × ███
```

### Perpendicular distance
Používáme **kolmou vzdálenost** (ne Euclidean) — koriguje fish-eye efekt:
```
perpDist = (mapX - originX + (1 - stepX) / 2) / dirX   // pro vertical hit
perpDist = (mapY - originY + (1 - stepY) / 2) / dirY   // pro horizontal hit
```

### Výška sloupce
```
columnHeight = screenHeight / perpDist
```

### Srovnání s originálem
Originální Wolf3D v C používal fixed-point 16.16 aritmetiku (celá čísla,
bitové posuny). My používáme JS floating-point — jednodušší, dostatečně přesné
pro Canvas rendering.

## Procedurální textury

### Klíčové architektonické rozhodnutí
Originální Wolf3D měl 64×64 bitmapové textury v VSWAP.WL6. My je nahrazujeme
**procedurálními generátory** — funkce, která z (x, y, tileType) vrátí barvu.

### Přístup
1. Při startu hry se pro každý tile type (1–63) zavolá generátor
2. Výstup = `Uint32Array[64×64]` (ABGR pixely)
3. Cache v `Map<number, Uint32Array>`
4. Při renderingu wall column: lookup texel z cache

### Typy textur (plánované)
| Tile | Popis | Technika |
|------|-------|----------|
| 1 | Červené cihly | Grid pattern + noise pro maltu |
| 2 | Šedý kámen | Voronoi-like buňky + variace jasu |
| 3 | Dřevo | Vertikální pruhy + sinusová distorze |
| 4 | Modrý kámen | Jako 2, modrá paleta |
| 5 | Kovové panely | Pravidelná mřížka + nýty |
| 6 | Vlajka/ornament | Geometrický vzor (čáry, symboly) |

### Shading
- N/S stěny (vertical grid hit, side=0): plný jas
- E/W stěny (horizontal grid hit, side=1): 75% jas
- Distance fog: lineární fade k černé (volitelné)

## Billboard sprity (nepřátelé bez spriteů)

### Problém
Originál měl 8-direction sprite sheets pro každého nepřítele.
My nemáme žádné obrázky.

### Řešení: Procedurální billboard geometrie
Nepřátelé jsou kresleni jako **2D geometrické tvary** na billboardu
(vždy čelem ke kameře):

- **Guard**: hnědý obdélník (tělo) + menší obdélník (hlava) + linie (ruce/zbraň)
- **SS**: modrý obdélník + helmice (půlkruh)
- **Dog**: horizontální oválný tvar + trojúhelník (tlama)
- **Boss**: větší verze s detaily

### Animace
- WALK: oscilace pozice nohou (sinusoida)
- ATTACK: ruka/zbraň se zdvihne
- PAIN: flash bílou barvou
- DEATH: tvar se zmenší/zhroutí (scale + translate)

### Rendering
1. Transformace world → screen space (jako origál: `transx`, `transy`, `viewx`)
2. Výška z distance (jako stěna)
3. Kresba do pixel bufferu přes procedurální generátor tvaru
4. Z-clip pomocí depth bufferu ze stěn

## Renderovací pipeline

```
Každý frame:
┌─────────────────────────────────────────┐
│  1. Screen.clear()                       │
│     └─ strop (tmavě šedá)              │
│     └─ podlaha (šedá)                  │
│                                          │
│  2. Raycaster.castRays(camera)          │
│     └─ DDA pro 640 sloupců             │
│     └─ výstup: RayHit[] (dist, tile,   │
│        textureX, side)                  │
│                                          │
│  3. drawWalls(screen, rays)             │
│     └─ pro každý sloupec:              │
│        výška = screenH / dist           │
│        lookup textura z cache           │
│        kresba texturovaného sloupce     │
│     └─ zápis do depth buffer            │
│                                          │
│  4. drawSprites(screen, camera, ents)   │
│     └─ sort by distance (far→near)     │
│     └─ pro každý sprite:              │
│        billboard transform              │
│        procedurální geometrie           │
│        depth clip proti stěnám         │
│                                          │
│  5. drawHUD(ctx, gameState)             │
│     └─ Canvas 2D overlay               │
│     └─ zbraň, zdraví, munice, score   │
│                                          │
│  6. Screen.present()                    │
│     └─ putImageData() na canvas         │
└─────────────────────────────────────────┘
```

## Herní smyčka

```
init()
  └─ vytvoř Screen, Camera, GameMap, Input, Raycaster
  └─ requestAnimationFrame(loop)

loop(timestamp)
  ├─ dt = delta time
  ├─ FPS counter update
  ├─ update(dt)
  │   ├─ camera.update(input, dt)      — pohyb hráče
  │   ├─ enemies.forEach(e.update())   — AI update
  │   ├─ doors.update(dt)              — animace dveří
  │   └─ gameState.update()            — score, health check
  ├─ draw()
  │   ├─ screen.clear()
  │   ├─ raycaster.castRays(camera)
  │   ├─ drawWalls()
  │   ├─ drawSprites()
  │   ├─ drawHUD()
  │   └─ screen.present()
  └─ requestAnimationFrame(loop)
```

## Mapový formát

### Tile kódování
```
0       = prázdné (průchozí)
1–63    = typy stěn (odpovídají procedurálním texturám)
64–99   = dveře (64=normální, 65=gold lock, 66=silver lock, 67=výtah)
100–199 = statické objekty (pickup, dekorace)
200+    = spawn pointy nepřátel
```

### Originální vs naše řešení
Originál měl dvě roviny (plane0 = stěny/dveře, plane1 = objekty/spawn).
My používáme jedno 2D pole s rozšířeným kódováním + separátní entity list.

## Srovnání přístupů z referencí

| Aspekt | Originál (C) | Seidelin | vpoupet | Lim | **Naše řešení** |
|--------|-------------|----------|---------|-----|-----------------|
| Rendering | VGA planar | DOM slices | Canvas ImageData | Canvas setPixel | **Canvas Uint32Array** |
| Math | Fixed-point 16.16 | Fixed-point JS | Float | Float | **Float** |
| Textury | VSWAP bitmapy | PNG z VSWAP | VSWAP binary | Loaded PNGs | **Procedurální** |
| Moduly | C files | 30 JS files | 5 JS files | 1 JS file | **~15 ES modules** |
| AI | State machine | Port originálního AI | Zjednodušené | Žádné | **State machine** |
| Audio | AdLib/SB | OGG files | Žádné | Žádné | **Web Audio syntéza** |
