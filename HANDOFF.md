# Wolf3D Web Remake — Visual Overhaul Handoff Prompt

## Context
This is a Wolfenstein 3D (1992, id Software) web remake built entirely in vanilla JavaScript + HTML5 Canvas. All graphics are procedurally generated (no external images). The game is functionally complete but **visually does NOT match the original Wolf3D**. Your task is to make it look like an exact copy.

## Reference: Original Wolfenstein 3D (1992)
The original had these defining visual characteristics:
- **Status bar**: BRIGHT BLUE (RGB ~0,0,168) background, NOT dark/teal/modern. Simple bordered sections with LARGE white pixel numbers. Layout: `FLOOR | SCORE | LIVES | [BJ FACE] | HEALTH% | AMMO | [WEAPON ICON]`. No health bars, no armor bars, no kill counters, no weapon slot grids.
- **Wall textures**: BOLD, SATURATED colors. Gray stone walls are medium gray (~RGB 128,128,128), NOT dark gray. Red brick is vivid red. Blue stone is clearly blue. Everything has VISIBLE CONTRAST.
- **Ceiling**: Solid dark gray (~RGB 56,56,56)
- **Floor**: Solid lighter gray (~RGB 112,112,112) — distinctly lighter than ceiling
- **Distance shading**: Gentle darkening, walls NEVER go fully black. Original used palette-index shifting.
- **No crosshair, no minimap, no toast messages** in the original.
- **Weapon view**: Centered at bottom of viewport, detailed silhouette with hands visible.

## Current Problems (see screenshots for comparison)

### Problem 1: Status Bar is WRONG
**Current**: Dark navy gradient `rgba(18,26,34,0.96)` with modern health/armor bars, cluttered stats (SEC, TRS, weapon slots). Looks like a modern game HUD.
**Should be**: Bright blue `#0000A8` solid background. Simple bordered sections. FLOOR number, SCORE, LIVES count, BJ FACE (centered, large), HEALTH %, AMMO count, WEAPON icon. White pixel-font numbers. Gray beveled borders on sections. That's it — nothing else.

### Problem 2: Wall Textures are WASHED OUT
**Current**: Base colors are extremely dark (gray stone #666666, brick #676767, blue stone #394678). Everything looks dim and similar.
**Should be**: 
- Gray stone: medium gray blocks (~#808080-#989898), clear mortar lines
- Red brick: VIVID RED (~#A83020-#C84030), dark mortar
- Blue stone: clearly BLUE (~#384888-#4858A0)
- Wood: warm BROWN/TAN (~#906838-#A87848)
- All textures need MORE CONTRAST between blocks and mortar

### Problem 3: Fog is Too Aggressive
**Current**: FOG_NEAR=3, FOG_FAR=10, fades to pure black. Everything beyond 10 units is black.
**Should be**: FOG_NEAR=6, FOG_FAR=20, max darkening ~50%. Walls never go fully black. The original Wolf3D was bright and visible even at distance.

### Problem 4: Ceiling/Floor Too Dark
**Current**: Ceiling #333333, Floor #555555 — both too dark.
**Should be**: Ceiling #383838, Floor #707070 — floor should be noticeably lighter than ceiling.

### Problem 5: Weapon Sprites Too Simple
**Current**: Very basic rectangles for weapon views.
**Should be**: More detailed, recognizable weapon silhouettes (Luger pistol shape, knife blade, shotgun barrels).

### Problem 6: BJ Face Not Enough Like Original
**Current**: Simple oval face with minimal features.
**Should be**: More detailed with visible flat-top haircut, pronounced features, expressive mood states.

## Files to Modify

### Priority 1: Status Bar (`src/renderer/hud.js`)
Completely rewrite `drawStatusBar()`:
- Background: solid bright blue `#0000A8`
- Section borders: lighter blue `#0000D8` highlights, darker `#000078` shadows (3D beveled look)
- Layout (left to right): FLOOR section | SCORE section | LIVES section | BJ FACE (center) | HEALTH section | AMMO section | WEAPON ICON section
- All text: large white pixel-font numbers
- BJ face should be ~48x48px, centered prominently
- Weapon icon: small sprite of current weapon in rightmost section
- NO health bars, NO armor bars, NO kill/secret/treasure counters, NO weapon slot grid
- Status bar height: ~80px (bottom of 640x400 screen)

### Priority 2: Wall Textures (all files in `src/textures/walls/`)
Each texture is 64x64 pixels painted on Canvas 2D.

**BrickWallPainter.js** (tile 1):
- Mortar: `#401808` (dark brown)
- Bricks: 16x8px, half-offset rows, RGB range `#A83020` to `#C84030` (vivid red)
- Each brick: top-left highlight (+30), bottom-right shadow (-30)

**GrayStonePainter.js** (tile 4):
- Mortar: `#404040` (medium dark gray)
- Stone blocks: irregular 16-32px wide, 8-16px tall, `#808080` to `#989898` (medium gray)
- Clear highlight/shadow per block

**BlueStonePainter.js** (tile 2):
- Mortar: `#1C1C40` (dark blue)
- Blocks: `#384888` to `#5868A8` (vivid blue)
- Same layout as gray stone

**WoodPainter.js** (tile 3):
- Planks: 8-10px wide, `#906838` to `#A87848` (warm tan/brown)
- Dark groove lines `#483018` between planks
- Horizontal metal bands at 1/3 and 2/3 height

**OrnamentWallPainter.js** (tile 6):
- Deep red `#A80000` background
- Gold `#D0A030` border frame
- White/cream medallion with iron cross symbol

**MetalPanelPainter.js** (tile 5):
- Blue-gray steel `#708090` to `#8898A8`
- Recessed panels with rivets

### Priority 3: Fog/Shading (`src/renderer/walls.js`)
```js
const FOG_NEAR = 6;
const FOG_FAR = 20;
const FOG_MAX = 0.50; // never darker than 50%
```
Side wall brightness: 0.75 (not 0.72)

### Priority 4: Ceiling/Floor (`src/renderer/screen.js`)
```js
this.ceilingColor = 0xFF383838; // #383838 ABGR
this.floorColor = 0xFF707070;   // #707070 ABGR — noticeably lighter
```

### Priority 5: Weapon Views (`src/sprites/view/WeaponViewPainter.js`)
Make weapon sprites more detailed and recognizable. The pistol should look like a Luger, the knife like a dagger, the shotgun like a double-barrel.

### Priority 6: BJ Face (`src/sprites/ui/UIPainter.js`)
More detailed face with:
- Flat-top haircut (original BJ style)
- Visible eyes with whites and pupils
- Expressive mouth (changes with health state)
- Blue uniform collar below face

## Architecture Notes
- `src/textures/TextureGenerator.js` — registry of all tile painters, caches textures
- `src/textures/TexturePainter.js` — base class with helpers (drawBrick, addNoise, drawRivet, etc.)
- `src/sprites/SpriteGenerator.js` — registry of all sprite painters
- `src/sprites/SpritePainter.js` — base class for sprite painters
- Screen is 640x400 (2x original 320x200)
- Viewport: top 320px for 3D, bottom 80px for status bar
- Pixel format: ABGR (Uint32Array, little-endian)
- `Screen.rgb(r,g,b)` helper creates ABGR colors
- All textures are 64x64 pixels
- All sprites are 64x64 pixels

## Key Constraint
**NO external images, sprites, or assets.** Everything must be painted with Canvas 2D API (fillRect, arc, beginPath, etc.) or generated into pixel arrays. This is a core project rule.

## Verification
After changes, the game should look like a screenshot of the original Wolf3D:
- Bright blue status bar with FLOOR/SCORE/LIVES/FACE/HEALTH/AMMO/WEAPON
- Bold, saturated wall textures with clear contrast
- Visible detail at distance (not faded to black)
- Recognizable weapon in hand
- BJ's face clearly visible in status bar center

## Commit & Push
After making changes, commit to main and push. One commit is fine. Message should describe the visual overhaul.
