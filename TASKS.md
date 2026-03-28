# TASKS.md — Canvas 2D Painting task list

## Fáze 0: Foundation (prerequisity)
- [ ] [S] TexturePainter base class s helper metodami `(deps: none)`
- [ ] [S] SpritePainter base class s helper metodami `(deps: none)`
- [ ] [S] TextureGenerator orchestrátor (registr `tileType -> painter`, cache) `(deps: TexturePainter base class)`
- [ ] [S] SpriteGenerator orchestrátor (registr `entityType + state + dir -> painter`, cache) `(deps: SpritePainter base class)`
- [ ] [S] Debug view — HTML stránka zobrazující všechny vygenerované textury v gridu `(deps: TextureGenerator orchestrátor)`
- [ ] [S] Debug view — HTML stránka zobrazující všechny sprite framy v gridu `(deps: SpriteGenerator orchestrátor)`

## Fáze 1: Stěnové textury (kritická cesta)
- [ ] [M] BrickWallPainter (Tile 1) — červené/šedé cihly `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [M] BlueStonePainter (Tile 2) — modrý kámen `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [M] WoodPainter (Tile 3) — dřevěné panely `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [M] GrayStone2Painter (Tile 4) — šedý kámen varianta `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [M] MetalPanelPainter (Tile 5) — kovové panely `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [M] OrnamentWallPainter (Tile 6) — vlajka/ornament `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [S] PrisonBarsPainter (Tile 7) — mříže `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [S] CrackedStonePainter (Tile 8) — popraskané zdivo `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [M] Integrace textur do rendereru (napojení na raycaster) `(deps: BrickWallPainter, BlueStonePainter, WoodPainter, GrayStone2Painter, MetalPanelPainter, OrnamentWallPainter, TextureGenerator orchestrátor)`

## Fáze 2: Dveře a speciální stěny
- [ ] [M] DoorPainter — standardní dveře (vertikální prkna + klika) `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [S] LockedDoorGoldPainter — zlatý zámek `(deps: DoorPainter)`
- [ ] [S] LockedDoorSilverPainter — stříbrný zámek `(deps: DoorPainter)`
- [ ] [M] ElevatorDoorPainter — kovové výtahové dveře `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [S] ElevatorSwitchPainter — přepínač na stěně `(deps: TexturePainter base class, TextureGenerator orchestrátor)`
- [ ] [S] SecretWallPainter — zeď s nepatrným vizuálním hintem `(deps: CrackedStonePainter)`

## Fáze 3: Statické sprity
- [ ] [S] HealthPickupPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] AmmoPickupPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] WeaponPickupPainters (knife, pistol, machinegun, chaingun) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] TreasurePickupPainters (cross, chalice, chest, crown) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] KeyPickupPainters (gold, silver) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] FoodPickupPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] BarrelPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] TablePainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] LampPainter `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [S] DecorationPainters (skeleton, plant, armor, blood, columns, pots) `(deps: SpritePainter base class, SpriteGenerator orchestrátor)`
- [ ] [M] Sprite rendering engine (billboard, z-clip, scaling) `(deps: SpriteGenerator orchestrátor, HealthPickupPainter, AmmoPickupPainter, BarrelPainter)`

## Fáze 4: Enemy sprity (nejpracnější fáze)
- [ ] [XL] GuardPainter — STAND + WALK×4 + ATTACK×3 + PAIN + DEATH×4 × 8 směrů `(deps: SpritePainter base class, SpriteGenerator orchestrátor, Debug view — HTML stránka zobrazující všechny sprite framy v gridu)`
- [ ] [XL] SSPainter — stejný rozsah, modrá uniforma + helmice `(deps: SpritePainter base class, SpriteGenerator orchestrátor, GuardPainter)`
- [ ] [L] DogPainter — STAND + WALK×4 + ATTACK×3 + DEATH×4 (bez směrů, nebo 4 směry) `(deps: SpritePainter base class, SpriteGenerator orchestrátor, Debug view — HTML stránka zobrazující všechny sprite framy v gridu)`
- [ ] [XL] BossPainter (Hans Grosse) — plný sprite sheet `(deps: SpritePainter base class, SpriteGenerator orchestrátor, GuardPainter)`
- [ ] [M] Enemy animation state machine (napojení na AI) `(deps: GuardPainter, SSPainter, DogPainter)`
- [ ] [M] Directional sprite selection (výběr správného směru dle úhlu ke kameře) `(deps: GuardPainter, SSPainter, DogPainter, Sprite rendering engine)`

## Fáze 5: First-person zbraně a HUD
- [ ] [M] KnifeViewPainter — nůž + animace útoku `(deps: SpritePainter base class)`
- [ ] [M] PistolViewPainter — pistole + recoil + muzzle flash `(deps: SpritePainter base class)`
- [ ] [M] MachineGunViewPainter `(deps: SpritePainter base class, PistolViewPainter)`
- [ ] [M] ChainGunViewPainter — rotující hlavně `(deps: SpritePainter base class, MachineGunViewPainter)`
- [ ] [S] Weapon bob animation (idle sway) `(deps: KnifeViewPainter, PistolViewPainter)`
- [ ] [S] Weapon switch animation `(deps: KnifeViewPainter, PistolViewPainter, MachineGunViewPainter, ChainGunViewPainter)`
- [ ] [M] HUD layout — health, ammo, score, keys, face `(deps: none)`
- [ ] [L] BJ Face painter — 3+ stavy zdraví, pain flash `(deps: SpritePainter base class, HUD layout — health, ammo, score, keys, face)`

## Fáze 6: Polish a efekty
- [ ] [S] Distance fog (lineární fade k černé) `(deps: Integrace textur do rendereru)`
- [ ] [S] Hit flash (červený overlay při zásahu) `(deps: HUD layout — health, ammo, score, keys, face)`
- [ ] [S] Pickup flash (žlutý/bílý flash) `(deps: HUD layout — health, ammo, score, keys, face)`
- [ ] [M] Screen transitions (fade to black mezi levely) `(deps: HUD layout — health, ammo, score, keys, face)`
- [ ] [S] Death screen (červenání + pád kamery) `(deps: Hit flash (červený overlay při zásahu))`
- [ ] [M] Menu screen — title, start game, nová hra malovaná v Canvas 2D `(deps: HUD layout — health, ammo, score, keys, face, Screen transitions (fade to black mezi levely))`
