# PROGRESS.md — Checklist celého projektu

## Fáze 0: Setup
- [x] Adresářová struktura
- [x] Referenční repozitáře naklonované a prostudované
- [x] Řídící soubory (CLAUDE.md, README.md, PROGRESS.md, ARCHITECTURE.md, TIMELINE.md, DEVLOG.md)
- [x] Základní index.html s Canvas a FPS counter
- [x] ES module scaffold — všechny soubory s exporty

## Fáze 1: Raycasting engine
- [x] Canvas setup, render loop, FPS counter
- [x] DDA raycasting algoritmus — základ (castSingleRay)
- [x] Perpendicular distance korekce (anti-fisheye)
- [x] Pohyb hráče — chůze, rotace (WASD + šipky)
- [x] Kolize se stěnami (per-axis sliding)
- [x] Testovací mapa 8×8
- [ ] Vykreslování stěn — výška sloupců z distance
- [ ] Rozlišení N/S vs E/W stran (světlé/tmavé)
- [ ] Podlaha a strop (solid color nebo gradient)
- [ ] Minimap overlay (pro debugging)
- [ ] Strafe pohyb (Q/E) — hotovo v kameře, testovat

## Fáze 2: Procedurální grafika stěn
- [ ] Systém textur — generátor, cache, lookup z tile type
- [ ] Textura: červené cihly (brick pattern s maltou)
- [ ] Textura: šedý kámen (nepravidelné kameny)
- [ ] Textura: dřevo (vertikální pruhy, suky)
- [ ] Textura: modrý kámen (Eagle's Nest styl)
- [ ] Textura: kovové dveře/panely
- [ ] Textura: vlajka/ornament (geometrický vzor)
- [ ] Světlé/tmavé strany stěn (N/S vs E/W dimming)
- [ ] Texture mapping — wallX coordinate → texel lookup
- [ ] Distance-based shading (fog effect)

## Fáze 3: Mapa a levely
- [ ] Formát mapy rozšířit — dveře, spawn pointy, předměty
- [ ] Level E1M1 — přepis originální mapy jako JS pole
- [ ] Dveře — otevírání animace (sliding)
- [ ] Dveře — kolize (blokují když zavřené)
- [ ] Dveře — auto-close po OPENTICS
- [ ] Zamčené dveře (klíče: gold, silver)
- [ ] Push walls (tajné místnosti)
- [ ] Level E1M2–E1M10 (zbylé mapy epizody 1)
- [ ] Přechod mezi levely (výtah)
- [ ] End-level statistiky (kills, secrets, treasures, time)

## Fáze 4: Nepřátelé
- [ ] Sprite billboarding — objekt vždy čelem k hráči
- [ ] Procedurální geometrie: Guard (hnědý voják)
- [ ] Procedurální geometrie: SS (modrý voják)
- [ ] Procedurální geometrie: Officer (bílý důstojník)
- [ ] Procedurální geometrie: Dog (pes)
- [ ] Procedurální geometrie: Boss (Hans Grosse)
- [ ] AI stav: STAND — stojí na místě, čeká
- [ ] AI stav: PATROL — pochůzka po waypointech
- [ ] AI detekce hráče — line-of-sight (DDA) + area connectivity
- [ ] AI stav: CHASE — pronásledování (greedy pathfinding)
- [ ] AI stav: ATTACK — střelba na hráče
- [ ] AI stav: PAIN — reakce na zásah
- [ ] AI stav: DEATH — animace smrti
- [ ] Zvuková detekce — střelba upozorní nepřátele v connected areas
- [ ] Z-sorting spriteů (painter's algorithm)
- [ ] Depth clipping — sprity za stěnami neviditelné

## Fáze 5: Zbraně a combat
- [ ] Procedurální zbraň na HUD — nůž (geometrie z kódu)
- [ ] Procedurální zbraň: pistole
- [ ] Procedurální zbraň: automat (machine gun)
- [ ] Procedurální zbraň: chain gun
- [ ] Animace střelby (3–4 framy z kódu)
- [ ] Raycast detekce zásahu (hit-scan z pozice hráče)
- [ ] Damage systém — vzdálenost ovlivňuje poškození
- [ ] Zdraví hráče — damage od nepřátel
- [ ] Smrt hráče — animace, restart
- [ ] Pickup: munice, zdraví, klíče, score předměty
- [ ] Pickup: nové zbraně
- [ ] Procedurální geometrie pickupů

## Fáze 6: HUD a UI
- [ ] Status bar — zdraví, životy, munice, score, level číslo
- [ ] Procedurální tvář hráče (BJ face) — reaguje na health
- [ ] Čísla a text — Canvas 2D font rendering
- [ ] Hlavní menu — New Game, Continue
- [ ] Difficulty select (baby, normal, hard, death incarnate)
- [ ] Pause menu
- [ ] Game over screen
- [ ] Ovládání — dokumentace na obrazovce
- [ ] Touch controls pro mobilní web
- [ ] Fullscreen toggle
- [ ] Mouse look (pointer lock API)

## Fáze 7: Audio
- [ ] Web Audio API inicializace (user gesture)
- [ ] Zvuk: střelba pistole (noise burst + envelope)
- [ ] Zvuk: střelba automat
- [ ] Zvuk: nůž (swish)
- [ ] Zvuk: kroky hráče
- [ ] Zvuk: otevírání dveří
- [ ] Zvuk: pickup předmětu
- [ ] Zvuk: nepřítel — alert/výkřik
- [ ] Zvuk: nepřítel — střelba
- [ ] Zvuk: nepřítel — smrt
- [ ] Zvuk: hráč zraněn
- [ ] Zvuk: hráč smrt
- [ ] 3D audio positioning (stereo pan z úhlu ke zdroji)
- [ ] Ambient — tichý hum generátoru

## Fáze 8: Kompletní hra
- [ ] Všech 10 levelů epizody 1
- [ ] Boss level (E1M10 — Hans Grosse)
- [ ] Tajné levely (E1M9)
- [ ] Přechody mezi levely s výtahem
- [ ] Score systém — body za kills, treasures, secrets, time bonus
- [ ] Save/load přes localStorage
- [ ] Par times (cílové časy pro perfektní score)
- [ ] Victory screen po dokončení epizody
- [ ] GitHub Pages deploy
- [ ] Performance optimalizace — profiling, bottleneck fix
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness
