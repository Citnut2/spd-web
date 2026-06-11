# PLAN.md — SPD Web Port

Port **Shattered Pixel Dungeon** (1,277 Java files, v3.3.5) from Java/LibGDX → TypeScript/PixiJS 8.

**Scope:** 85 enemies + 5 bosses, 358 items, 87 buffs, 26 depths, 156 rooms, 53 windows, 86 sprites, 31+67 audio tracks.

---

## Phase 0: Foundation ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Project scaffold: Vite + TS6 + PixiJS8 + Vitest + Playwright | ✅ | `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` |
| 0.2 | SDT Framework: schema, harnesses, diff engine, scripts | ✅ | `sdt/**` — 87/88 unit tests pass |
| 0.3 | Port watabou utils | ✅ | `Random.ts` (seedrandom+MX3), `Geom.ts`, `Bundle.ts`, `Signal.ts`, `PathFinder.ts` |
| 0.4 | Render engine: `Renderer.ts`, `Camera.ts` | ✅ | 160×144 virtual res → 4x canvas, camera with smooth pan/shake |
| 0.5 | Game loop: `Game.ts`, `SPDGame.ts` | ✅ | rAF-based loop + turn scheduler |
| 0.6 | Actor system: `Actor.ts`, `ActorQueue.ts` | ✅ | Priority queue (VFX=100, HERO=0, MOB=-20, BUFF=-30) |
| 0.7 | Input system: keyboard → Hero.act() | ✅ | Arrow/WASD keys, `spd:scene` custom events |
| 0.8 | Scene infrastructure: `Scene.ts`, `SceneManager.ts` | ✅ | Async scene switching, camera injection |
| 0.9 | Title + HeroSelect scenes | ✅ | Text menu with scene transitions |
| 0.10 | Asset loading + rendering pipeline | ✅ | `Assets.load()`-based, DungeonRenderer + Tilemap system |

## Phase 1: Core Gameplay ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Terrain (40 types + flag bitmask) | ✅ | `Terrain.ts` — constants match Java, 14 flags |
| 1.2 | `Level.ts` base: size, FOV, flags, cleanWalls | ✅ | map[], flags, visited/mapped, `updateFieldOfView()` |
| 1.3 | Room system (Room, StandardRoom, SpecialRoom, builders) | ✅ | Full port: Room, StandardRoom, SpecialRoom, builders, painters, 10 special rooms |
| 1.4 | SewerLevel: rooms, corridors, water, grass, decorations | ✅ | Entrance/exit, water/grass tiles, all sewer mob types ported (unwired) |
| 1.5 | `Dungeon.ts`: seed, depth, init, newLevel | ✅ | `goDown()`, `initHero()`, depth transitions |
| 1.6 | `Char.ts`: HP, attack, defense, damage, movement | ✅ | HP/STR, min/max attack, damage roll, buffs, alignment |
| 1.7 | `Hero.ts`: 6 classes, stats, level, XP | ✅ | HeroClass enum, level-up bonuses, STR caps |
| 1.8 | Belongings: Backpack + equipment slots | ✅ | `Belongings.ts` with weapon/armor/artifact/ring/misc, iterator |
| 1.9 | `Mob.ts` + AI states (sleep/wander/hunt/flee) | ✅ | Mob AI with search + enemy detection |
| 1.10 | Rat, Slime | ✅ | Enemy sprites + behaviour |
| 1.11 | Combat system: attack(), hit(), damageRoll() | ✅ | Damage reduction, accuracy |
| 1.12 | Fog of War (shadow casting) + FOV | ✅ | Canvas-based 2px/tile visibility overlay, dirty rect tracking |
| 1.13 | HUD (StatusPane, Toolbar, GameLog, BuffIndicator) | ✅ | HUD with health, inventory button, game log messages |
| 1.14 | Tile rendering system | ✅ | DungeonTileSheet, Tilemap Sprite-based, DungeonRenderer |
| 1.15 | Water rendering (SkinnedBlock UV scroll) | ✅ | PixiJS TilingSprite with animated Y-UV scroll |
| 1.16 | Terrain features (plants, traps, high grass) | 🔲 | |
| 1.17 | Hero/mob sprite rendering on tilemap | ✅ | CharSprite, HeroSprite, MobSprite base + 8 mob sprite classes (Rat, Slime, Gnoll, Snake, Crab, Swarm, Goo, Hero) |
| 1.18 | Smooth movement: sprite slides 100ms + camera follows | ✅ | `startMove/updateMove`, `isBusy` input lock, smooth pan |
| 1.19 | Crisp rendering: nearest-neighbor × roundPixels × hi-DPI text | ✅ | 4x nearest, `roundPixels:true`, `textResolution = SCALE × DPR` |
| 1.20 | ViewportManager refactoring (singleton → dependency) | ✅ | No singletons, ResizeObserver, safe-area insets, integer+frac scale |
| **→** | **Playable: hero moves, fights rats, explores Sewers** | ✅ | WASD movement, combat, fog-of-war, HUD, tile rendering, mob AI |

## Phase A: Gameplay Loop Sewers (Active)

| # | Task | Priority | Status |
|---|------|----------|--------|
| A1 | Wire mob variety in SewerLevel (Gnoll, Crab, Swarm, Snake, Slime) — classes exist, createMob() only returns Rat | High | 🔲 |
| A2 | Item pickup on step-over (heap detection → collect) | High | ✅ |
| A3 | WndBag interactive inventory (equip/use/drop via UI) | High | ✅ |
| A4 | SewerBossLevel + Goo boss | Medium | 🔲 |
| A5 | PrisonLevel painter + rooms | Medium | 🔲 |
| A6 | Interactable tiles (doors, traps, wells, grass) | Medium | 🔲 |

## Phase 2: Items & Inventory

| # | Task | Files | Status |
|---|------|-------|--------|
| 2.1 | Item, EquipableItem, KindofMisc, KindOfWeapon | `Item.ts`, `EquipableItem.ts` | ✅ |
| 2.2 | Gold | `Gold.ts` | ✅ |
| 2.3 | Heap system (drop/pickup/stack) | `Heap.ts` | ✅ |
| 2.4 | Generator: deck-based probability, category registration | `Generator.ts` | ✅ |
| 2.5 | Potions (12) + Scrolls (12) | `potions/`, `scrolls/` | ✅ |
| 2.6 | Wand base + WandOfMagicMissile + DamageWand | `wands/` | ✅ |
| 2.7 | Ring base + RingOfAccuracy + RingOfEvasion | `rings/` | ✅ |
| 2.8 | Artifact base (13 subclasses pending) | `artifacts/Artifact.ts` | ✅ (base only) |
| 2.9 | Food: MysteryMeat + Food base | `food/` | ✅ |
| 2.10 | Melee weapons (T1-T5, 25 classes) | `weapon/melee/` | 🔲 (4/25) |
| 2.11 | Armor (Cloth/Leather + 7 higher tiers) | `armor/` | 🔲 (2/9) |
| 2.12 | Item sprites (ItemSpriteSheet + ItemSprite) | `sprites/` | ✅ |
| 2.13 | Item spawning in level creation | `RegularLevel.createItems()` | ✅ (basic) |
| 2.14 | Missile weapons (16), darts (11) | — | 🔲 |
| 2.15 | Remaining rings (10) + wands (12) | — | 🔲 |
| 2.16 | Bags, Keys, Seeds, Stones, Trinkets, Bombs | — | 🔲 |
| 2.17 | WndBag interactive + WndUseItem action window | — | ✅ |
| 2.18 | Equip/Unequip wiring (MeleeWeapon, Armor) | — | ✅ |

## Phase 3: Dungeon Content

| # | Task | Status |
|---|------|--------|
| 3.1 | Special rooms (10/24: Shop, Pool, Garden, Lab, Pit, WeakFloor, MagicWell, Traps, Statue, Vault) | ✅ |
| 3.2 | Standard room subtypes (~40) | 🔲 |
| 3.3 | Connection room subtypes (7) | 🔲 |
| 3.4 | Level types (Prison, Caves, City, Halls) | 🔲 (SewerLevel only) |
| 3.5 | Boss levels (5) | 🔲 |
| 3.6 | Traps system | 🔲 |
| 3.7 | Shops + shopOnLevel | 🔲 |
| 3.8 | Enemy variety (85 types, 7 sewer mob classes ported, 2 wired: Rat, Slime) | 🔲 | Gnoll, Crab, Swarm, Snake, Goo classes exist but not spawned |

## Phase 4: Advanced Systems

| # | Task | Status |
|---|------|--------|
| 4.1 | Buff system base (Buff, FlavourBuff, CounterBuff, ShieldBuff, AllyBuff) | ✅ |
| 4.2 | Concrete buffs (20/87: Burning, Frost, Chill, Poison, Paralysis, Haste, Invisibility, Levitation, MindVision, Bless, Amok, Terror, MagicalSleep, Hunger, Regeneration, AllyBuff, CounterBuff, ShieldBuff, FlavourBuff) | 🔲 (20/87) |
| 4.3 | Blob system (22 types) | 🔲 |
| 4.4 | Quests, NPCs | 🔲 |
| 4.5 | Talents | 🔲 |
| 4.6 | Alchemy system | 🔲 |
| 4.7 | UI windows (53 types) | 🔲 |
| 4.8 | Save/load (Bundle system) | 🔲 |
| 4.9 | Badges, achievements | 🔲 |

## Phase 5: Polish & Meta

| # | Task | Status |
|---|------|--------|
| 5.1 | Visual effects (35 types) | 🔲 |
| 5.2 | Audio (31+67 tracks) | 🔲 |
| 5.3 | Ascension system | 🔲 |
| 5.4 | Game over + replay | 🔲 |

## Phase 6: Testing & Deploy

| # | Task | Status |
|---|------|--------|
| 6.1 | Unit tests | 87/88 pass |
| 6.2 | E2E tests | 6/6 pass |
| 6.3 | SDT parity tests (Java vs Web) | 🔲 (needs ParityOracle.jar) |
| 6.4 | Performance profiling | 🔲 |
| 6.5 | Mobile touch input | 🔲 |
| 6.6 | Web/mobile/desktop deploy | 🔲 |

---

## Current State

```
tsc --noEmit  → 0 errors
npm test      → 87/88 pass (1 pre-existing parity test needs ParityOracle.jar)
npm run build → success
npm run test:e2e → 6/6 pass
```

**What's playable:** Hero walks with WASD/arrows, fights Rats in Sewers (5 other mob types ported but not spawned), fog-of-war, smooth camera, item spawning (potions, scrolls, wands, rings, food, gold), HUD with health/inventory button, interactive inventory (open bag → view items → equip/use/drop), item pickup on step-over.

**Porting state of all 7 Sewer mobs:** All classes (Rat, Gnoll, Crab, Slime, Snake, Swarm, Goo) and their sprites are fully implemented. 20/87 buffs ported. 3 melee weapons, 2 armor types, 12 potions, 12 scrolls, wand-of-MM, 2 rings, food base.

---

## Rendering Architecture

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
                    ├── fogOfWar (FogOfWar — canvas-based overlay)
                    └── HUD (uiLayerRef)
                          ├── StatusPane (HP, hunger)
                          ├── Toolbar (inventory/actions)
                          ├── BuffIndicator
                          └── GameLog (message history)
```

**Layer order (matching Java GameScene):**
1. ✅ Water — `WaterRenderer` (TilingSprite, Y-UV scrolling)
2. ✅ DungeonTerrainTilemap — terrain tiles
3. ✅ DungeonWallsTilemap — wall overhangs
4. ✅ Sprites — HeroSprite + mob sprites
5. ✅ FogOfWar — canvas-based visibility overlay
6. ✅ UI overlays — HUD, WndBag, WndUseItem

---

## Next Steps (Phase A Order)

Sewer mob classes (Rat, Gnoll, Crab, Slime, Snake, Swarm, Goo) and all mob sprites are fully ported — just not wired.

1. **A1** — Wire all 7 mob types into SewerLevel.createMobs() with depth-based probability table
2. **Wire mob sprites in GameScene** — load textures + instantiate correct sprite classes per mob type
3. **A4** — SewerBossLevel: boss arena + Goo boss placement on depth 5
4. **Mob loot drops** — wire Mob.createLoot() into Mob.die()
5. **Fix Albino bleeding** — uncomment Bleeding buff in Albino.attackProc()
6. **A6** — Interactable tiles: doors, traps, wells, high grass
7. **A5** — PrisonLevel port: painter, rooms, depth 6-10

---

## Key Tech Notes

| Topic | Detail |
|-------|--------|
| Virtual resolution | 160×144, mapped to 640×576 canvas via `root.scale.set(4)` |
| Tile sheet | 256×256 PNG, 16×16 tiles → 16 cols × 16 rows (256 frames) |
| Tile rendering | `Sprite`-based with cached sub-Textures (auto-batched by PixiJS) |
| Water | Separate PNGs (water0–4, 32×32), 4-neighbor stitch, animated UV offset |
| RNG | `seedrandom` + MX3 scrambler; `Random.Long()` for Java parity |
| Asset loading | `await Assets.load(path)` — never `Texture.from()` (zero-size before load) |
| Camera | Smooth pan + shake, `camera.container` stays in `renderer.root` (never re-parented) |
| Text rendering | `makeText()`: `_autoResolution=false`, `resolution=SCALE×DPR`, PixelFont |
| Smooth movement | `CharSprite.startMove/updateMove` (100ms interpolation), `isBusy` blocks input |
| Scene query | `window.__spdQuery`: flat scene graph walk for Playwright E2E |
| eventMode | All containers up to `renderer.root` must be `'static'` for click propagation |
| Buff API | `Buff.append<T>`, `Buff.affect<T>`, `Buff.prolong<T>` — static generics matching Java |
| Generator | Deck-based probability with separate RNG seeds per category |
| Action UI pattern | `Item.actions(hero)` → buttons → `Item.execute(hero, action)` — mirrors Java WndUseItem |

---

## Java Source Paths

| Resource | Path |
|----------|------|
| Game logic | `/home/citnut/Desktop/shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/` |
| Watabou engine | `/home/citnut/Desktop/shattered-pixel-dungeon/SPD-classes/src/main/java/com/watabou/` |
| Assets | `/home/citnut/Desktop/shattered-pixel-dungeon/core/src/main/assets/` |
| Local mirror | `/workspaces/spd-web/tmp/shattered-pixel-dungeon/` |

## Analysis Utilities

| Tool | Usage |
|------|-------|
| codegraph | `npx codegraph query "class X" --path <specific-file>` — always pass `--path` |
