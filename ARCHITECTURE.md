# ARCHITECTURE.md — Technická architektura

## DDA Raycasting algoritmus

### Princip
Pro každý sloupec obrazovky (640 sloupců) vyšleme paprsek z pozice kamery
pod odpovídajícím úhlem. Paprsek prochází 2D mřížkou mapy (64×64 tiles)
a hledáme první stěnu, kterou protne.

### DDA (Digital Differential Analyzer)
Místo testování bodů podél paprsku v malých krocích (pomalé) používáme DDA:

1. Spočítáme vzdálenost k první vertikální a horizontální grid čáře
2. Vždy postoupíme k bližší grid čáře
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
Používáme kolmou vzdálenost (ne Euclidean) — koriguje fish-eye efekt:

```
perpDist = (mapX - originX + (1 - stepX) / 2) / dirX   // pro vertical hit
perpDist = (mapY - originY + (1 - stepY) / 2) / dirY   // pro horizontal hit
```

### Výška sloupce

```
columnHeight = screenHeight / perpDist
```

### Srovnání s originálem
Originální Wolf3D v C používal fixed-point 16.16 aritmetiku. My používáme
JS floating-point — jednodušší, dostatečně přesné pro Canvas rendering.

## Canvas 2D Painted Textures

### Klíčové architektonické rozhodnutí
Originální Wolf3D měl 64×64 bitmapové textury ve VSWAP.WL6. My je nahrazujeme
Canvas 2D painter pipeline: každá stěnová textura a každá wall-face varianta
se namaluje na neviditelný offscreen canvas, přečte přes `getImageData()` a
uloží do `Uint32Array` cache.

### Proč Canvas 2D painting místo alternativ
| Přístup | Problém |
|--------|---------|
| Simplex / Perlin noise generátory | Působí algoritmicky a špatně drží Wolf3D pixel-art feel |
| Hardcoded `Uint32Array` pixely | Špatně se iterují a LLM je nespolehlivě generuje po tisících hodnot |
| GLSL shadery | Overkill pro 64×64, komplikují pipeline a nepřidávají adekvátní kvalitu |
| Canvas 2D painting | Expresivní, debugovatelný, iterovatelný přes vizuální zpětnou vazbu |

### Princip
1. `TextureGenerator.init()` vytvoří interní offscreen canvas 64×64
2. Pro každý `tileType` vybere odpovídající painter třídu
3. Painter zavolá `paint(ctx, 64, 64)` a složí obraz po vrstvách
4. Výsledek se exportuje jako `Uint32Array[64 * 64]`
5. Renderer při kresbě sloupce už jen lookupuje texel z cache

### Iterativní workflow
1. Napíšeme painter funkci nebo třídu pro konkrétní tile
2. Výsledek zobrazíme v debug view gridu
3. Vizuálně porovnáme s referenční Wolf3D texturou
4. Upravíme proporce, barvy, spáry, highlighty, noise
5. Opakujeme dokud textura nepůsobí čitelně na 64×64

### Registr wall tile painterů (1–8)

#### Tile 1 — Červené/šedé cihly
Postup:
- Base fill: tmavě šedá `#505050`
- Cihly: 8×4 grid, liché řady offsetované o 50 %, `fillRect()` pro každou cihlu
- Barva cihel: jitter mezi `#606060` a `#707070`, per-cihla variace jasu
- Malta: 1px mezery mezi cihlami, barva `#383838`
- Stíny: dolní a pravý okraj každé cihly tmavší o 15 % pro AO efekt
- Noise pass: finální per-pixel jitter ±5 brightness
- Highlight: 4–6 náhodně světlejších cihel pro worn efekt

#### Tile 2 — Modrý kámen
Postup:
- Base fill: tmavě modrá `#2A2A5A`
- Kamenné bloky: nepravidelné obdélníky 10–22px šířka, 8–18px výška
- Spáry: 1px tmavší `#1A1A3A`, s horizontálním a vertikálním offsetem ±1px
- Surface detail: jemný per-pixel noise pro zrnitou kamennou strukturu
- Vodorovné pruhy: 3–4 pásy s mírnou změnou jasu pro vrstvení
- Edge highlights: horní hrany některých bloků zesvětlené o 8 %

#### Tile 3 — Dřevěné panely
Postup:
- Base fill: hnědá `#6B4226`
- Vertikální prkna: 8px široké pásy s 1px tmavou spárou
- Letokruhy: horizontální sinusoidy s nízkou amplitudou 1–2px
- Grain bands: střídání `#7A4B2E` a `#5B351D`
- Suky: 1–2 malé elipsy `#4A2816` s lehkým highlightem
- Spáry mezi prkny: tmavě hnědá `#3B2415`, 1px
- Wear pass: několik světlejších vertikálních škrábanců

#### Tile 4 — Šedý kámen varianta 2
Postup:
- Base fill: neutrální šedá `#5F5F5F`
- Bloky: větší kameny 16–28px šířka, 14–24px výška
- Paleta: variace mezi `#555555` a `#777777`
- Spáry: méně husté než Tile 2, 1px `#3D3D3D`
- Hloubka: masivnější dolní stíny na blocích, 2px tmavší hrana
- Surface noise: jemný jitter ±4 brightness

#### Tile 5 — Kovové panely / výtahové dveře
Postup:
- Base: vertikální gradient `#A8A8A8` → `#6C6C6C`
- Panely: 2–3 zapuštěné obdélníky s inner shadow přes `shadowBlur`
- Nýty: malé kruhy 2–3px (`arc`) v rozích panelů, highlight nahoře vlevo
- Horizontální švy: tenké tmavé linky `#4A4A4A`
- Specular pass: úzký světlejší pruh `#C8C8C8` u levé hrany
- Edge grime: tmavé rohy s `globalAlpha` 0.18

#### Tile 6 — Vlajka / ornamentální zeď
Postup:
- Base: tmavě červená `#8B0000`
- Border: zlatý pruh 2px po obvodu, `#B8860B`
- Centrální znak: bílý kruh nebo zjednodušený heraldický orel
- Fabric efekt: jemné vertikální vlny přes světlejší a tmavší pásy
- Shadow fold: radiální gradient tmavší u krajů
- Dirt pass: několik tmavších skvrn s `globalAlpha` 0.12

#### Tile 7 — Vězeňské mříže overlay
Postup:
- Base fill: špinavě šedý kámen `#4A4A4A`
- Svislé mříže: 5–6 kovových prutů 4px širokých, `#7A7A7A`
- Vodorovné příčky: dvě tmavší spojnice `#5E5E5E`
- Highlight: levé hrany prutů zesvětlené na `#A0A0A0`
- Shadow: pravé hrany prutů stažené do `#3A3A3A`
- Pozadí za mříží: lehce ztmavený stone inset pro hloubku

#### Tile 8 — Popraskaný kámen s břečťanem
Postup:
- Base fill: šedozelený kámen `#62685A`
- Velké bloky: 14–24px bloky s nepravidelnými spárami `#44483D`
- Praskliny: `Path2D` tenké linky 1px v barvě `#2F332B`
- Břečťan: 2–3 popínavé větve, tmavě zelená `#2E5A34`, listy jako malé elipsy
- Damp pass: spodní třetina o 10 % tmavší
- Noise: jemný pixel jitter pro omšelý povrch

### Registr speciálních wall-face painterů (64–68)

#### Tile 64 — Standard door
Postup:
- Base fill: dřevo `#6B4226`
- Vertikální prkna: 4 širší panely oddělené 1px spárami
- Rám: tmavší obvod `#4A2E1A`, 2px
- Středový kovový pás: horizontální pruh `#6E6E6E`
- Klika: malý kruh a krátká linka vpravo

#### Tile 65 — Locked door gold
Postup:
- Base: stejná konstrukce jako standard door
- Centrální zámek: zlatá destička `#C9A227`, 12×12px
- Klíčová dírka: černý drop shape 3×5px
- Rohové nýty: 4 malé kruhy `#E0C45A`
- Highlight: horní hrana zámku zesvětlená na `#F0D56E`

#### Tile 66 — Locked door silver
Postup:
- Base: stejná jako standard door, lehce chladnější hnědá
- Centrální zámek: stříbrná destička `#B9C0C8`, 12×12px
- Klíčová dírka: tmavě šedá `#23262A`
- Nýty: světle stříbrné `#D8DEE4`
- Cool shadow: pravý a spodní okraj destičky `#7F8790`

#### Tile 67 — Elevator door
Postup:
- Base: kovový gradient `#B0B0B0` → `#5F5F5F`
- Dveřní křídla: dvě poloviny oddělené středovou spárou 2px
- Výtahový symbol: šipka nahoru/dolů v tmavém panelu
- Panel seams: horizontální spoje a drobné nýty
- Floor grime: dolní 6px ztmavených pro opotřebení

#### Tile 68 — Elevator switch
Postup:
- Base plate: tmavý kovový panel `#4E545B`, 18×28px na středu textury
- Switch housing: vnitřní rámeček `#7D848C`
- Tlačítko: červený nebo žlutý obdélník `#C04020`, 8×10px
- Indicator lamp: malý kruh `#F0D050` s radiálním glow
- Kabeláž/šrouby: 4 rohové nýty a jedna tenká vertikální štěrbina

### Caching a technické detaily
- `TextureGenerator` drží interní offscreen canvas 64×64, nikdy se nepřidává do DOM
- `paintTexture(tileType): Uint32Array` namaluje konkrétní tile a vrátí exportovaný buffer
- Cache: `Map<number, Uint32Array>` naplněná jednorázově při `init()`
- Helper metody v base class:
  - `addNoise(ctx, intensity)`
  - `addAO(ctx, blockRects, intensity)`
  - `jitterColor(baseHex, range)`
  - `exportToUint32Array(ctx, w, h)`

## Canvas 2D Painted Sprites

### Princip
Každý sprite frame se maluje na offscreen canvas 64×64. Výstup se exportuje do
`Uint32Array` a ukládá do `Map<string, Uint32Array>`, kde klíč je například
`guard_walk_front_0`, `officer_attack_right_1` nebo `dog_death_3`.

### Enemy sprite plans

#### GUARD — hnědý voják
Velikost: 64×64
Barvy:
- Uniforma `#6B4226`
- Kůže `#D4A574`
- Boty `#3D2B1F`
- Vlasy `#2B1A12`
- Pistole `#3A3A3A`

Frames:
- `STAND_FRONT`
  - Hlava: ovál 10×12px, vlasy jako tmavý horní pás 3px
  - Tělo: trapezoid 18×22px, uniforma
  - Pásek: 1px tmavý pruh v pase
  - Nohy: dva obdélníky 6×14px, spodní 3px boty
  - Ruce: 4×12px po stranách
  - Zbraň: malý tmavý obdélník v pravé ruce
  - Detaily: 2 knoflíky 2px, jednoduchý límec
- `WALK_1` až `WALK_4`
  - `WALK_1`: levá noha vpřed +3px, pravá vzad -3px
  - `WALK_2`: nohy u sebe, mírný bob trupu o 1px dolů
  - `WALK_3`: pravá vpřed, levá vzad
  - `WALK_4`: nohy u sebe, trup 1px nahoru
  - Ruce se hýbou v protifázi s nohama
- `ATTACK_1` až `ATTACK_3`
  - Pravá ruka rotovaná nahoru přibližně 45°
  - Pistole míří do kamery
  - `ATTACK_2`: muzzle flash žlutobílý kruh `#F7E27A` a bílý střed
- `PAIN`
  - Celé tělo zesvětlené o 20 %
  - Posun o 1–2px dozadu
- `DEATH_1` až `DEATH_4`
  - `DEATH_1`: náklon trupu, ruce povolené
  - `DEATH_2`: kolena pokrčená, tělo níž
  - `DEATH_3`: ležící na zádech, nohy pokrčené
  - `DEATH_4`: plochý corpse frame, tmavší stín pod tělem

Směry:
- `FRONT`, `FRONT_RIGHT`, `RIGHT`, `BACK_RIGHT`, `BACK`, `BACK_LEFT`, `LEFT`, `FRONT_LEFT`
- `RIGHT/LEFT`: užší tělo, profil hlavy, viditelná jen jedna ruka
- `BACK`: bez obličeje, záda uniformy, žádná viditelná zbraň
- Šikmé směry: střední šířka těla, částečně viditelná zbraň a profil hlavy

#### SS OFFICER — modrý voják
Velikost: 64×64
Barvy:
- Uniforma `#1A3A5C`
- Kůže `#D2A07A`
- Helmice `#4E5661`
- Boty `#22252A`
- SMG `#35393F`

Rozvrh frameů:
- Stejný rozsah frameů jako Guard
- Hlava: místo vlasů půlkruhová helmice se světlejším horním lemem
- Tělo: ostřejší ramena, dva světlejší výložkové pixely
- Zbraň: delší submachine gun přes hruď
- `ATTACK_2`: širší muzzle flash než u Guard
- `PAIN`: modrá uniforma flashne do desaturované modrošedé

#### DOG — německý ovčák
Velikost: 64×64
Barvy:
- Srst `#6A4A2B`
- Tmavé části `#1F1A17`
- Jazyk `#B95E6A`

Frames:
- `STAND`
  - Tělo: horizontální ovál přibližně 30×14px
  - Hlava: menší ovál vpředu, tmavší čenich
  - Nohy: 4 tenké obdélníky 3×12px
  - Ocas: krátká linka vzadu nahoru
- `WALK_1` až `WALK_4`
  - Nohy animované ve dvou párech
  - Trup bobuje o 1px
  - Ocas lehce mění úhel
- `ATTACK_1` až `ATTACK_3`
  - Hlava vysunutá dopředu
  - Otevřená tlama jako tmavý trojúhelník
  - `ATTACK_2`: červený jazyk a výraznější zuby
- `DEATH_1` až `DEATH_4`
  - Postupné složení nohou pod tělo
  - Finální corpse frame jako plochý boční ovál

Směry:
- Minimum 4 směry: `FRONT`, `RIGHT`, `BACK`, `LEFT`
- Volitelně 8 směrů, pokud silueta zůstane čitelná

#### BOSS — Hans Grosse
Velikost: 64×64, figura zabírá 46–52px šířky
Barvy:
- Uniforma `#334255`
- Brnění `#9CA3AA`
- Kůže `#D2A07A`
- Chain guns `#51575E`

Frames:
- `STAND`: masivnější proporce, trup 1.5× širší než Guard
- `WALK_1` až `WALK_4`: kratší krok, výrazný pohyb ramen
- `ATTACK_1` až `ATTACK_3`: obě ruce dopředu, dvojité muzzle flashes
- `PAIN`: výraznější flash a drobný záklon
- `DEATH_1` až `DEATH_4`: pomalejší těžký pád, roztažené ruce

Směry:
- 8 směrů jako Guard
- `FRONT`: obě chain guns viditelné
- `RIGHT/LEFT`: širší profil, jedna zbraň předsazená
- `BACK`: viditelné zadní brnění a popruhy

### Statické sprity — pickupy
- Health kit: bílý box 18×14px, červený kříž 8×8px, spodní stín
- Ammo: hnědý box `#6A4C2A`, nahoře 4–5 žlutých nábojů `#D9B84C`
- Key gold: zlatý klíč, obdélník + dva kruhové otvory
- Key silver: stejný tvar, paleta `#C2C8CF`
- Chicken / food: hnědý drumstick, světlejší kost
- Machine gun: tmavý boční profil zbraně s kratší hlavní
- Chaingun: delší profil, 3 kruhové hlavně a boční box
- Treasure set:
  - Cross: zlatý kříž `#D3B24D`
  - Chalice: pohár se světlejším lemem
  - Crown: zlatá koruna s červenými body
  - Chest: hnědozlatá truhla s kovovým pásem

### Statické sprity — dekorace
- Barrel: zelený válec `#4C6A3A`, žlutý hazard symbol
- Table with plates: hnědý stůl, 2 bílé kruhy jako talíře
- Lamp: žlutý kruh nahoře, šedý sloup, jemný glow
- Skeleton: bílé kosti na tmavém podkladu
- Plant: zelené listy, hnědý květináč
- Suit of armor: šedý rytířský tvar, tmavý průzor helmy
- Pool of blood: červený ovál s tmavším okrajem

## Texture & Sprite Technical Implementation

### Cílová adresářová struktura

```
src/
  textures/
    TextureGenerator.js
    TexturePainter.js
    walls/
      BrickWallPainter.js
      BlueStonePainter.js
      WoodPainter.js
      GrayStone2Painter.js
      MetalPanelPainter.js
      OrnamentWallPainter.js
      PrisonBarsPainter.js
      CrackedStonePainter.js
    doors/
      DoorPainter.js
      LockedDoorGoldPainter.js
      LockedDoorSilverPainter.js
      ElevatorDoorPainter.js
      ElevatorSwitchPainter.js
      SecretWallPainter.js
  sprites/
    SpriteGenerator.js
    SpritePainter.js
    enemies/
      GuardPainter.js
      SSPainter.js
      DogPainter.js
      BossPainter.js
    pickups/
      HealthPainter.js
      AmmoPainter.js
      KeyPainter.js
      FoodPainter.js
      WeaponPickupPainter.js
      TreasurePainter.js
    decorations/
      BarrelPainter.js
      TablePainter.js
      LampPainter.js
      SkeletonPainter.js
      PlantPainter.js
      ArmorSuitPainter.js
      BloodPoolPainter.js
```

### TexturePainter base class
Helper metody:
- `drawBrick(ctx, x, y, w, h, color, aoIntensity)`
- `addSurfaceNoise(ctx, w, h, intensity)`
- `addAmbientOcclusion(ctx, rects, intensity)`
- `jitterColor(baseHex, range): string`
- `drawRivet(ctx, cx, cy, radius)`
- `drawWoodGrain(ctx, w, h, baseColor, grainColor)`
- `pixelate(ctx, w, h, blockSize)`
- `exportToUint32Array(ctx, w, h): Uint32Array`

### SpritePainter base class
Doporučené helper metody:
- `drawShadowEllipse(ctx, cx, cy, rx, ry, alpha)`
- `drawLimb(ctx, x, y, w, h, color)`
- `drawMuzzleFlash(ctx, x, y, radius, innerColor, outerColor)`
- `drawArmorPlate(ctx, x, y, w, h, baseColor, highlightColor)`
- `mirrorFrame(sourceKey, targetKey)` pro levé/pravé směry
- `exportToUint32Array(ctx, w, h): Uint32Array`

### Generator orchestrace
- `TextureGenerator` mapuje `tileType -> painter`
- `SpriteGenerator` mapuje `entityType + state + direction + frameIndex -> painter output`
- Oba generátory používají jeden interní offscreen canvas, před každým paintem ho clearují
- Generování probíhá při startu hry nebo při `debug view` reloadu
- Renderer ani AI nikdy nesahají do Canvas API přímo — berou jen již hotové `Uint32Array` buffery

## Renderovací pipeline

```
Každý frame:
┌──────────────────────────────────────────────┐
│  1. Screen.clear()                            │
│     └─ strop / podlaha                        │
│                                               │
│  2. Raycaster.castRays(camera)                │
│     └─ DDA pro každý screen column            │
│                                               │
│  3. drawWalls(screen, rays)                   │
│     └─ lookup texelů z TextureGenerator cache │
│     └─ shading podle side + distance fog      │
│                                               │
│  4. drawSprites(screen, camera, entities)     │
│     └─ billboard transform                    │
│     └─ sprite frame lookup ze SpriteGenerator │
│     └─ z-clip proti depth bufferu stěn        │
│                                               │
│  5. drawWeaponView(ctx, weaponState)          │
│     └─ Canvas 2D first-person weapon painter  │
│                                               │
│  6. drawHUD(ctx, gameState)                   │
│     └─ status bar, keys, score, BJ face       │
│                                               │
│  7. Screen.present()                          │
│     └─ putImageData() na canvas               │
└──────────────────────────────────────────────┘
```

## HUD & Weapon View

### First-person zbraně
- Renderují se přes Canvas 2D na spodní část obrazovky
- Každá zbraň má vlastní painter a jednoduchý stavový automat animací

#### Knife
- Čepel: šedý trojúhelník `#B8BCC2`
- Rukojeť: hnědý obdélník `#5B351D`
- Attack animace: rychlý diagonální slash

#### Pistol
- Tělo: tmavě šedý profil `#40444A`
- Ruka: tělová `#D4A574`
- Fire animace: recoil nahoru 5px + muzzle flash 2–3 framy

#### Machine gun
- Delší profil, přední mířidlo, žlutý nábojový pás
- Recoil kratší, ale častější než pistol

#### Chaingun
- Široké tělo, 3 rotující hlavně
- Animace: rotace hlavní + opakovaný muzzle flash burst

### Weapon animace
- `IDLE`: mírný bob přes sinusoidu, amplituda 2px
- `FIRE`: recoil nahoru, krátké rozšíření flash, návrat do idle
- `SWITCH`: slide dolů, výměna sprite, slide nahoru

### HUD
- Canvas 2D overlay na spodku obrazovky
- Modrošedý panel `#39424D`, bílý text, červená čísla při low health
- BJ face: malovaný 32×32 obličej, minimálně 3 health stavy
- Bloky HUD:
  - Health bar
  - Ammo counter
  - Score
  - Level
  - Keys

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
  │   ├─ drawWeaponView()
  │   ├─ drawHUD()
  │   └─ screen.present()
  └─ requestAnimationFrame(loop)
```

## Mapový formát

### Tile kódování
```
0       = prázdné (průchozí)
1–63    = typy stěn
64–99   = dveře a speciální wall-faces (64=normální, 65=gold lock, 66=silver lock, 67=výtah, 68=switch)
100–199 = statické objekty (pickup, dekorace)
200+    = spawn pointy nepřátel
```

### Originální vs naše řešení
Originál měl dvě roviny (plane0 = stěny/dveře, plane1 = objekty/spawn).
My používáme jedno 2D pole s rozšířeným kódováním + separátní entity list.

## Srovnání přístupů z referencí

| Aspekt | Originál (C) | Seidelin | vpoupet | Lim | Naše řešení |
|--------|--------------|----------|---------|-----|-------------|
| Rendering | VGA planar | DOM slices | Canvas ImageData | Canvas setPixel | Canvas Uint32Array |
| Math | Fixed-point 16.16 | Fixed-point JS | Float | Float | Float |
| Textury | VSWAP bitmapy | PNG z VSWAP | VSWAP binary | Loaded PNGs | Canvas 2D painted offscreen |
| Sprity | Sprite sheets | PNG sheets | VSWAP binary | Žádné | Canvas 2D painted sprite sheets |
| Moduly | C files | 30 JS files | 5 JS files | 1 JS file | ES modules |
| AI | State machine | Port originálního AI | Zjednodušené | Žádné | State machine |
| Audio | AdLib/SB | OGG files | Žádné | Žádné | Web Audio syntéza |
