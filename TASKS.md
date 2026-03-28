# TASKS.md — Canvas 2D Painting task list

## Fáze 0: Foundation (prerequisity)
- [x] [S] TexturePainter base class s helper metodami `(deps: none)`
- [x] [S] SpritePainter base class s helper metodami `(deps: none)`
- [x] [S] TextureGenerator orchestrátor (registr `tileType -> painter`, cache) `(deps: TexturePainter base class)`
- [x] [S] SpriteGenerator orchestrátor (registr `entityType + state + dir -> painter`, cache) `(deps: SpritePainter base class)`
- [x] [S] Debug view — HTML stránka zobrazující všechny vygenerované textury v gridu `(deps: TextureGenerator orchestrátor)`
- [x] [S] Debug view — HTML stránka zobrazující všechny sprite framy v gridu `(deps: SpriteGenerator orchestrátor)`

## Fáze 1: Stěnové textury (kritická cesta)
- [x] [M] BrickWallPainter (Tile 1) — červené/šedé cihly `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [M] BlueStonePainter (Tile 2) — modrý kámen `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [M] WoodPainter (Tile 3) — dřevěné panely `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [M] GrayStone2Painter (Tile 4) — šedý kámen varianta `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [M] MetalPanelPainter (Tile 5) — kovové panely `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [M] OrnamentWallPainter (Tile 6) — vlajka/ornament `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [S] PrisonBarsPainter (Tile 8) — mříže `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [S] CrackedStonePainter (Tile 9) — popraskané zdivo `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [M] Integrace textur do rendereru (napojení na raycaster) `(deps: BrickWallPainter, BlueStonePainter, WoodPainter, GrayStone2Painter, MetalPanelPainter, OrnamentWallPainter, TextureGenerator orchestrátor)`

## Fáze 2: Dveře a speciální stěny
- [x] [M] DoorPainter — standardní dveře (vertikální prkna + klika) `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [S] LockedDoorGoldPainter — zlatý zámek `(deps: DoorPainter)`
- [x] [S] LockedDoorSilverPainter — stříbrný zámek `(deps: DoorPainter)`
- [x] [M] ElevatorDoorPainter — kovové výtahové dveře `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [x] [S] ElevatorSwitchPainter — přepínač na stěně `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [S] SecretWallPainter — zeď s nepatrným vizuálním hintem `(deps: CrackedStonePainter)`

## Fáze 3: Statické sprity
- [x] [S] HealthPickupPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] AmmoPickupPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] WeaponPickupPainters (knife, pistol, machinegun, chaingun) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] TreasurePickupPainters (cross, chalice, chest, crown) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] KeyPickupPainters (gold, silver) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] FoodPickupPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] BarrelPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] TablePainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] LampPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [S] DecorationPainters (skeleton, plant, armor, blood, columns, pots) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [x] [M] Sprite rendering engine (billboard, z-clip, scaling) `(deps: SpriteGenerator orchestrátor, HealthPickupPainter, AmmoPickupPainter, BarrelPainter)`

## Fáze 4: Enemy sprity (nejpracnější fáze)
- [x] [XL] GuardPainter — STAND + WALK×4 + ATTACK×3 + PAIN + DEATH×4 × 8 směrů `(deps: SpritePainter base class, SpriteGenerator orchestrátor, Debug view — HTML stránka zobrazující všechny sprite framy v gridu)`
- [x] [XL] SSPainter — stejný rozsah, modrá uniforma + helmice `(deps: SpritePainter base class, SpriteGenerator orchestrátor, GuardPainter)`
- [x] [L] DogPainter — STAND + WALK×4 + ATTACK×3 + DEATH×4 (bez směrů, nebo 4 směry) `(deps: SpritePainter base class, SpriteGenerator orchestrátor, Debug view — HTML stránka zobrazující všechny sprite framy v gridu)`
- [x] [XL] BossPainter (Hans Grosse) — plný sprite sheet `(deps: SpritePainter base class, SpriteGenerator orchestrátor, GuardPainter)`
- [x] [M] Enemy animation state machine (napojení na AI) `(deps: GuardPainter, SSPainter, DogPainter)`
- [x] [M] Directional sprite selection (výběr správného směru dle úhlu ke kameře) `(deps: GuardPainter, SSPainter, DogPainter, Sprite rendering engine)`

## Fáze 5: First-person zbraně a HUD
- [x] [M] KnifeViewPainter — nůž + animace útoku `(deps: SpritePainter base class)`
- [x] [M] PistolViewPainter — pistole + recoil + muzzle flash `(deps: SpritePainter base class)`
- [x] [M] MachineGunViewPainter `(deps: SpritePainter base class, PistolViewPainter)`
- [x] [M] ChainGunViewPainter — rotující hlavně `(deps: SpritePainter base class, MachineGunViewPainter)`
- [x] [S] Weapon bob animation (idle sway) `(deps: KnifeViewPainter, PistolViewPainter)`
- [x] [S] Weapon switch animation `(deps: KnifeViewPainter, PistolViewPainter, MachineGunViewPainter, ChainGunViewPainter)`
- [x] [M] HUD layout — health, ammo, score, keys, face `(deps: none)`
- [x] [L] BJ Face painter — 3+ stavy zdraví, pain flash `(deps: SpritePainter base class, HUD layout — health, ammo, score, keys, face)`

## Fáze 6: Polish a efekty
- [x] [S] Distance fog (lineární fade k černé) `(deps: Integrace textur do rendereru)`
- [x] [S] Hit flash (červený overlay při zásahu) `(deps: HUD layout — health, ammo, score, keys, face)`
- [x] [S] Pickup flash (žlutý/bílý flash) `(deps: HUD layout — health, ammo, score, keys, face)`
- [x] [M] Screen transitions (fade to black mezi levely) `(deps: HUD layout — health, ammo, score, keys, face)`
- [x] [S] Death screen (červenání + pád kamery) `(deps: Hit flash (červený overlay při zásahu))`
- [x] [M] Menu screen — title, start game, nová hra malovaná v Canvas 2D `(deps: HUD layout — health, ammo, score, keys, face, Screen transitions (fade to black mezi levely))`

## Fáze 7: Dokončení epizody
- [x] [L] Rozšíření Episode 1 na 10 pater (tutorial + e1m1 až e1m9) `(deps: Menu screen — title, start game, nová hra malovaná v Canvas 2D, Enemy animation state machine)`
- [x] [S] Syntetizovaná ambientní hudba na pozadí `(deps: none)`
- [x] [M] Volba obtížnosti (easy / normal / hard) `(deps: Menu screen — title, start game, nová hra malovaná v Canvas 2D)`
- [x] [S] Fullscreen toggle z klávesnice `(deps: Menu screen — title, start game, nová hra malovaná v Canvas 2D)`
