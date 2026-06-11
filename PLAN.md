# PLAN.md — SPD Web Port

Port **Shattered Pixel Dungeon** (1,277 Java files, v3.3.5) từ Java/LibGDX → TypeScript/PixiJS 8.

**Scope:** 85 enemies + 5 bosses, 358 items, 87 buffs, 26 depths, 156 rooms, 53 windows, 86 sprites, 31+67 audio tracks.

---

## Phase 0: Foundation ✅ (Completed)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Project scaffold: Vite + TS6 + PixiJS8 + Vitest + Playwright | ✅ | `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` |
| 0.2 | SDT Framework: schema, harnesses, diff engine, scripts | ✅ | `sdt/**` — 4/4 tests pass |
| 0.3 | Port watabou utils | ✅ | `Random.ts` (seedrandom+MX3), `Geom.ts`, `Bundle.ts`, `Signal.ts`, `PathFinder.ts` (A* + setMapSize) |
| 0.4 | Render engine: `Renderer.ts`, `Camera.ts` | ✅ | 160×144 virtual res → 640×576 canvas (4x scale), camera with smooth pan/shake |
| 0.5 | Game loop: `Game.ts`, `SPDGame.ts` | ✅ | rAF-based loop + turn scheduler |
| 0.6 | Actor system: `Actor.ts`, `ActorQueue.ts` | ✅ | Priority queue (VFX=100, HERO=0, MOB=-20, BUFF=-30) |
| 0.7 | Input system: keyboard → Hero.act() | ✅ | Arrow/WASD keys, `spd:scene` custom events |
| 0.8 | Scene infrastructure: `Scene.ts`, `SceneManager.ts` | ✅ | Async-aware scene switching, camera injection |
| 0.9 | Title + HeroSelect scenes | ✅ | Text menu with scene transitions |
| 0.10 | Asset loading + rendering pipeline | ✅ | `Assets.load()`-based, DungeonRenderer + Tilemap system |

## Phase 1: Core Gameplay (In Progress)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Terrain (40 types + flag bitmask) | ✅ | `Terrain.ts` — constants match Java, 14 flags (PASSABLE, LOS_BLOCKING, LIQUID, PIT...) |
| 1.2 | `Level.ts` base: size, FOV, flags, cleanWalls | ✅ | `Level.ts` — map[], flags, visited/mapped, `tilesTex()`/`waterTex()`, `updateFieldOfView()` |
| 1.3 | Room system | 🔲 | Partially done inside SewerLevel (room+corridor gen) |
| 1.4 | SewerLevel: rooms, corridors, water, grass, decorations | ✅ | `SewerLevel.ts` — entrance/exit, water/grass tiles, Rat/Slime spawns |
| 1.5 | `Dungeon.ts`: seed, depth, init, newLevel | ✅ | `Dungeon.ts` — seedCurDepth, seedForDepth, 26-depth switch |
| 1.6 | `Char.ts`: HP, attack, defense, damage, movement | ✅ | HP/STR, min/max attack, damage roll, buffs, alignment |
| 1.7 | `Hero.ts`: 6 classes, stats, level, XP | ✅ | HeroClass enum, level-up bonuses, STR caps |
| 1.8 | `InputHandler.ts`: formal action system | 🔲 | Basic keyboard handling in main.ts, no formal SPDAction system |
| 1.9 | `Mob.ts`: AI states (sleep/wander/hunt/flee) | ✅ | Mob AI with search + enemy detection |
| 1.10 | Rat, Slime | ✅ | Enemy sprites + behaviour |
| 1.11 | Combat system: attack(), hit(), damageRoll() | ✅ | In `Char.ts` — damage reduction, accuracy |
| 1.12 | Fog of War (shadow casting) + FOV | ✅ | `FogOfWar.ts` — canvas-based 2px/tile visibility overlay, dirty rect tracking, wall half-cell rendering |
| 1.13 | HUD + status pane + health bar + game log | 🔲 | Basic GameScene created, no HUD |
| 1.14 | **Tile rendering system** | ✅ | **12 files ported:** DungeonTileSheet (200+ constants, stitching), Tilemap (Sprite-based), DungeonTerrainTilemap, DungeonWallsTilemap, DungeonRenderer, TextureFilm, SparseArray. Verified: 1189 terrain tiles + 255 wall tiles render with correct sub-textures. |
| 1.15 | Water rendering (SkinnedBlock UV scroll) | ✅ | `WaterRenderer.ts` — PixiJS TilingSprite with animated Y-UV scroll |
| 1.16 | Terrain features (plants, traps, high grass) | 🔲 | |
| 1.17 | Hero/mob sprite rendering on tilemap | ✅ | `CharSprite`, `HeroSprite`, `MobSprite`, `RatSprite`, `SlimeSprite` |
| 1.18 | Smooth movement: sprite slides 100ms + camera follows | ✅ | `CharSprite.startMove/updateMove`, `isBusy` input lock, camera `centerOn`→smooth pan, `snapToCell` for init |
| 1.19 | Crisp rendering: nearest-neighbor × roundPixels × hi-DPI text | ✅ | `TextureSource.defaultOptions.scaleMode='nearest'`, `roundPixels:true` renderer, `_autoResolution=false` + `resolution=SCALE×DPR`, `document.fonts.ready` preload |
| **→** | **Playable: hero moves, fights rats, explores Sewers** | ✅ | Hero walks with WASD/arrows, attacks mobs, collision, fog-of-war, mob AI |

## Phase 2: Items & Inventory (Weeks 9-16)

| # | Task | Files | Status |
|---|------|-------|--------|
| 2.1–2.16 | All item systems | ~249 files | 🔲 |

## Phase 3: Dungeon Content (Weeks 17-24)

| # | Task | Status |
|---|------|--------|
| 3.1–3.8 | Enemies, bosses, traps, plants, rooms | 🔲 |

## Phase 4: Advanced Systems (Weeks 25-32)

| # | Task | Status |
|---|------|--------|
| 4.1–4.10 | Buffs, blobs, quests, NPCs, talents, alchemy, UI | 🔲 |

## Phase 5: Polish & Meta (Weeks 33-38)

| # | Task | Status |
|---|------|--------|
| 5.1–5.9 | Effects, audio, save/load, badges, ascension | 🔲 |

## Phase 6: Testing & Deploy (Weeks 39-42)

| # | Task | Status |
|---|------|--------|
| 6.1–6.5 | Tests, parity, perf, mobile, deploy | 🔲 |

---

## Rendering Architecture (Current)

```
app.stage (PixiJS v8 Application)
  └── renderer.root (Container, scale=4 → 640×576 canvas)
        └── camera.container (moves via Camera.update)
              └── scene.container (TitleScene / HeroSelectScene / GameScene)
                    ├── dungeonRenderer.container
                    │     ├── waterLayer (WaterRenderer — TilingSprite, Y-UV scroll)
                    │     ├── DungeonTerrainTilemap (terrain tiles)
                    │     ├── DungeonWallsTilemap (wall overhangs)
                    │     └── sprites (HeroSprite + MobSprites)
                    └── fogOfWar (FogOfWar — canvas-based overlay)
```

**Layer order (matching Java GameScene):**
1. ✅ **Water** — `WaterRenderer` (TilingSprite, Y-UV scrolling)
2. ✅ **DungeonTerrainTilemap** — terrain tiles (floor, walls, doors, grass)
3. ✅ **DungeonWallsTilemap** — wall overhangs, internal walls
4. ✅ **Sprites** — `HeroSprite` + mob sprites (`RatSprite`, `SlimeSprite`)
5. ✅ **FogOfWar** — canvas-based visibility overlay (2px/tile)
6. 🔲 **UI overlays** — toolbar, health, inventory, game log

## Next Steps (Immediate)

1. ✅ **Water rendering** — `WaterRenderer.ts` (TilingSprite, Y-UV scroll)
2. ✅ **FogOfWar** — `FogOfWar.ts` (canvas-based 2px/tile, dirty rects, wall half-cells)
3. ✅ **Hero sprite** — `CharSprite`/`HeroSprite` on tilemap with collision + combat
4. ✅ **Smooth movement** — sprite slides 100ms, camera follows
5. ✅ **Crisp rendering** — nearest-neighbor, roundPixels, hi-DPI text
6. **SDT Java harness** — run first headless parity test (requires Java build)
7. **HUD + status pane** — health bar, game log, toolbar
8. **Items/Inventory** — gold, potions, scrolls, weapons (Phase 2)

## Key Tech Notes

| Topic | Detail |
|-------|--------|
| Virtual resolution | 160×144, mapped to 640×576 canvas via `root.scale.set(4)` |
| Tile sheet | 256×256 PNG, 16×16 tiles → 16 cols × 16 rows (256 frames) |
| Tile rendering | `Sprite`-based with cached sub-Textures (1444 sprites/layer, auto-batched by PixiJS) |
| Water | Separate PNGs (water0–4.png, 32×32), 4-neighbor stitch, animated UV offset |
| RNG | `seedrandom` + MX3 scrambler with generator stack; `Random.Long()` for Java parity |
| Asset loading | `await Assets.load(path)` — never `Texture.from()` (returns zero-size before load) |
| Camera | Smooth pan + shake, `camera.container` must stay in `renderer.root` (never re-parented) |
| Text rendering | `makeText()` in `src/ui/text.ts`: `_autoResolution=false`, `resolution=SCALE×DPR`, PixelFont + `document.fonts.ready` |
| Smooth movement | `CharSprite.startMove/updateMove` (100ms interpolation), `isBusy` blocks input, camera target set on arrival |
| Codegraph | Always via `npx codegraph query ... --path <specific-file>` |

## SDT Framework Architecture

```
sdt/
├── schema/            # TypeScript types shared across harnesses
│   ├── TestScript.ts  # Script format (seed, actions, checkpoints)
│   ├── GameState.ts   # State dump schema (hero, level, mobs, items)
│   └── DiffReport.ts  # Diff result schema
├── java-harness/      # Runs original Java game headlessly
│   ├── build.gradle   # Depends on gdx-headless + :core
│   ├── settings.gradle
│   └── src/main/java/ParityOracle.java
├── web-harness/       # Runs web port in Vitest
│   └── parity.test.ts
├── diff-engine/       # Compares JSON dumps
│   └── DiffEngine.ts
├── sync-tracker/      # Auto-updated porting status
│   └── SYNC_STATUS.md
└── scripts/
    ├── run-parity.sh       # Single pass
    └── run-parity-loop.sh  # AI agent loop
```

### Parity Test Lifecycle
1. Load test script (seed + hero class + action sequence)
2. Run on Java side → dump JSON state at checkpoints
3. Run on Web side → dump JSON state at checkpoints
4. DiffEngine compares → writes SYNC_STATUS.md
5. If all pass → parity satisfied. If not → agent fixes web code.

---

## Java Source Paths

| Resource | Path |
|----------|------|
| Game logic | `/home/citnut/Desktop/shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/` |
| Watabou engine | `/home/citnut/Desktop/shattered-pixel-dungeon/SPD-classes/src/main/java/com/watabou/` |
| Assets | `/home/citnut/Desktop/shattered-pixel-dungeon/core/src/main/assets/` |
