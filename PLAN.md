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

## Phase 1: Core Gameplay ✅ (Completed)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Terrain (40 types + flag bitmask) | ✅ | `Terrain.ts` — constants match Java, 14 flags (PASSABLE, LOS_BLOCKING, LIQUID, PIT...) |
| 1.2 | `Level.ts` base: size, FOV, flags, cleanWalls | ✅ | `Level.ts` — map[], flags, visited/mapped, `tilesTex()`/`waterTex()`, `updateFieldOfView()` |
| 1.3 | Room system (Room, StandardRoom, SpecialRoom, builders) | ✅ | Full port: Room.ts (462 lines), StandardRoom, SpecialRoom, builders (LoopBuilder, RegularBuilder), painters, 10 special room types |
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

## Phase 2: Items & Inventory (In Progress)

| # | Task | Files | Status |
|---|------|-------|--------|
| 2.1 | Item base class + subclasses (Item, EquipableItem, KindofMisc, KindOfWeapon) | `Item.ts`, `EquipableItem.ts`, `KindofMisc.ts`, `KindOfWeapon.ts` | ✅ |
| 2.2 | Gold | `Gold.ts` | ✅ |
| 2.3 | Heap system (drop/pickup/stack) | `Heap.ts` | ✅ |
| 2.4 | Generator: deck-based probability system, category registration | `Generator.ts` | ✅ |
| 2.5 | Consumables: Potions (all 12) + Scrolls (all 12) | `potions/*.ts`, `scrolls/*.ts` | ✅ |
| 2.6 | Wand base + WandOfMagicMissile + DamageWand | `wands/*.ts` | ✅ |
| 2.7 | Ring base + RingOfAccuracy + RingOfEvasion | `rings/*.ts` | ✅ |
| 2.8 | Artifact base (13 subclasses pending) | `artifacts/Artifact.ts` | ✅ (base only) |
| 2.9 | Food: MysteryMeat + Food base | `food/*.ts` | ✅ |
| 2.10 | Melee weapons (T1-T5, 25 classes, 4 ported) | `weapon/melee/*.ts` | 🔲 (4/25 ported) |
| 2.11 | Armor (Cloth/Leather + 7 higher tiers) | `armor/*.ts` | 🔲 (2/9 ported) |
| 2.12 | Item sprites (ItemSpriteSheet + ItemSprite) | `sprites/ItemSpriteSheet.ts`, `sprites/ItemSprite.ts` | ✅ |
| 2.13 | Item spawning in level creation | `RegularLevel.createItems()` | ✅ (basic implementation) |
| 2.14 | Missile weapons (16 classes), darts (11 classes) | — | 🔲 |
| 2.15 | Rings (10 more), Wands (12 more) | — | 🔲 |
| 2.16 | Bags, Keys, Seeds, Stones, Trinkets, Bombs | — | 🔲 |

## Phase 3: Dungeon Content (In Progress)

| # | Task | Status |
|---|------|--------|
| 3.1 | Special rooms (10 of 24 ported: Shop, Pool, Garden, Lab, Pit, WeakFloor, MagicWell, Traps, Statue) | ✅ (with TODO stubs for items/keys/NPCs) |
| 3.2 | Standard room subtypes (~40 in Java) | 🔲 (inline EmptyRoom only) |
| 3.3 | Connection room subtypes (7 in Java) | 🔲 (TunnelConnectionRoom stub only) |
| 3.4 | Level types: Prison, Caves, City, Halls (4 of 16 ported) | 🔲 (SewerLevel only) |
| 3.5 | Boss levels (SewerBoss, PrisonBoss, CavesBoss, CityBoss, HallsBoss) | 🔲 |
| 3.6 | Traps system | 🔲 (stub — trapClasses/Chances return empty) |
| 3.7 | Shops + shopOnLevel | 🔲 (always false) |
| 3.8 | Enemy variety (85 types, 2 ported: Rat, Slime) | 🔲 |

## Phase 4: Advanced Systems (In Progress)

| # | Task | Status |
|---|------|--------|
| 4.1 | Buff system base (Buff, FlavourBuff, CounterBuff, ShieldBuff, AllyBuff) | ✅ |
| 4.2 | Concrete buffs (15 of 87 ported: Burning, Frost, Chill, Poison, Paralysis, Haste, Invisibility, Levitation, MindVision, Bless, Amok, Terror, MagicalSleep, Hunger, Regeneration) | 🔲 (15/87) |
| 4.3 | Blob system (22 types) | 🔲 |
| 4.4 | Quests, NPCs | 🔲 |
| 4.5 | Talents | 🔲 |
| 4.6 | Alchemy system | 🔲 |
| 4.7 | UI windows (53 types) | 🔲 |
| 4.8 | Game log + messages | 🔲 |
| 4.9 | Save/load (Bundle system) | 🔲 |
| 4.10 | Badges, achievements | 🔲 |

## Phase 5: Polish & Meta

| # | Task | Status |
|---|------|--------|
| 5.1–5.9 | Effects, audio, save/load, badges, ascension | 🔲 |

## Phase 6: Testing & Deploy

| # | Task | Status |
|---|------|--------|
| 6.1–6.5 | Tests, parity, perf, mobile, deploy | 🔲 |

---

## Current State

```
tsc --noEmit → 0 errors
npm test     → 87/88 pass (1 pre-existing TEST-ABC Java parity without ParityOracle.jar)
vite build   → success (522 KiB)
```

**What's playable:** Hero walks with WASD, fights Rats/Slimes in Sewers, fog-of-war, smooth camera, item spawning via Generator.

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

1. HUD + status pane — health bar, game log, toolbar
2. Inventory UI — pick up, equip, use items
3. More enemies (Gnoll, Swarm, Crab, etc.)
4. Prison level + painter
5. Port remaining melee weapons (21 more)
6. SDT Java harness — run first headless parity test (requires Java build)

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
| Buff API | `Buff.append<T>`, `Buff.affect<T>`, `Buff.prolong<T>`, `Buff.count<T>` — static generics matching Java |
| Generator | Deck-based probability with separate RNG seeds per category; `fullReset`/`generalReset`/`reset` for run/floor/item resets |

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
