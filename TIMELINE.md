# TIMELINE.md — Sprinty a milestones

## Sprint 1: Viditelný raycaster
**Cíl**: Pohyb po mapě s vykreslenými stěnami na obrazovce.

- [x] Canvas setup, render loop, FPS
- [x] DDA raycasting základ
- [x] Kamera s pohybem a kolizemi
- [ ] Vykreslování stěn (barevné sloupce z distance)
- [ ] N/S vs E/W shading
- [ ] Podlaha/strop barvy
- [ ] Minimap pro debugging

**Milestone**: *Hráč se pohybuje po mapě a vidí 3D stěny.*

---

## Sprint 2: Procedurální textury
**Cíl**: Stěny mají různé texturové vzory generované kódem.

- [ ] Texture mapping (wallX → texel column)
- [ ] Generátor: cihly, kámen, dřevo
- [ ] Distance shading
- [ ] Větší testovací mapa

**Milestone**: *Mapa s různými texturami stěn, vše z kódu.*

---

## Sprint 3: Mapy a dveře
**Cíl**: Level E1M1 z originálu, funkční dveře.

- [ ] Level E1M1 tile data
- [ ] Dveře — otevírání, zavírání, kolize
- [ ] Zamčené dveře + klíče
- [ ] Push walls (tajné místnosti)
- [ ] Level přechod (výtah)

**Milestone**: *Průchod E1M1 — dveře, tajné stěny, výtah.*

---

## Sprint 4: Nepřátelé — vizuál
**Cíl**: Nepřátelé viditelní na mapě jako procedurální billboard tvary.

- [ ] Billboard rendering systém
- [ ] Procedurální geometrie (guard, SS, dog)
- [ ] Z-sorting + depth clipping
- [ ] Spawn z mapy

**Milestone**: *Nepřátelé viditelní v levelech jako geometrické tvary.*

---

## Sprint 5: Nepřátelé — AI
**Cíl**: Nepřátelé se pohybují, pronásledují a útočí.

- [ ] State machine (stand, patrol, chase, attack, pain, death)
- [ ] Line-of-sight detekce
- [ ] Greedy pathfinding
- [ ] Damage systém

**Milestone**: *Nepřátelé reagují na hráče, pronásledují ho, střílejí.*

---

## Sprint 6: Zbraně a combat
**Cíl**: Hráč může střílet a zabíjet nepřátele.

- [ ] Procedurální zbraně na HUD
- [ ] Hit-scan střelba
- [ ] Animace střelby
- [ ] 4 typy zbraní
- [ ] Zdraví, smrt, restart

**Milestone**: *Plně funkční combat — střílet, zabíjet, umírat.*

---

## Sprint 7: HUD a UI
**Cíl**: Kompletní herní UI.

- [ ] Status bar (zdraví, munice, tvář, score)
- [ ] Procedurální BJ face
- [ ] Menu systém (main, pause, game over)
- [ ] Pickup systém (munice, zdraví, klíče, treasures)

**Milestone**: *Hra vypadá jako kompletní Wolf3D s HUD a menu.*

---

## Sprint 8: Audio
**Cíl**: Zvuky z Web Audio API.

- [ ] Syntéza zvuků (střelba, kroky, dveře, nepřátelé)
- [ ] 3D positioning (stereo pan)
- [ ] Ambient

**Milestone**: *Hra má zvukový doprovod generovaný kódem.*

---

## Sprint 9: Levely a polish
**Cíl**: Celá epizoda 1 (10 levelů).

- [ ] E1M2 – E1M10
- [ ] Boss fight (Hans Grosse)
- [ ] Tajný level E1M9
- [ ] Score systém + end-level stats

**Milestone**: *Kompletní Epizoda 1 hratelná od začátku do konce.*

---

## Sprint 10: Deploy a polish
**Cíl**: Publikace na GitHub Pages.

- [ ] Performance optimalizace
- [ ] Cross-browser testing
- [ ] Mobile touch controls
- [ ] GitHub Pages deploy
- [ ] Save/load (localStorage)

**Milestone**: *Hra live na webu, hratelná na desktopu i mobilu.*

---

## Buffer sprint
Rezerva pro neočekávané problémy, performance issues, refactoring.
