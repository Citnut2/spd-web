# AGENTS.md — spd-clone

Web port of **Shattered Pixel Dungeon** (v3.3.5) from Java/LibGDX → TypeScript/PixiJS 8.

**Canonical source (do not modify):** `/home/citnut/Desktop/shattered-pixel-dungeon/`

Use `codegraph` via `npx` to analyze Java source (no full indexing needed — use `--path`):
```bash
npx codegraph query "class Rat"        --path <specific-java-file>
npx codegraph query "class Actor"      --path <specific-java-file>
npx codegraph query "Dungeon.init"     --path <specific-java-file>
```
Always pass `--path` to target a single file; never run codegraph without it (avoids indexing the entire SPD project).

## Quick Start
```bash
npm install
npm run dev              # Vite dev server → localhost:5174
npm test                 # Vitest unit tests
npm run test:e2e         # Playwright e2e tests
npm run build            # tsc && vite build
npm run parity           # SDT: run all parity tests (Java vs Web)
npm run parity:loop      # SDT: iterative loop for AI agents
```

## SDT — Shattered Dungeon Test Framework
Validates parity between Java original and Web port using deterministic RNG:
- `sdt/schema/` — shared types (TestScript, GameState, DiffReport)
- `sdt/java-harness/` — ParityOracle.java (headless LibGDX, dumps JSON state)
- `sdt/web-harness/` — parity.test.ts (Vitest, same scripts, dumps same JSON)
- `sdt/diff-engine/` — compares dumps, reports mismatches
- `sdt/sync-tracker/SYNC_STATUS.md` — auto-updated porting progress

```bash
./sdt/scripts/run-parity.sh --seed "TEST-ABC" --hero "WARRIOR"
# Output: sdt/sync-tracker/SYNC_STATUS.md
```

## SDT Test Agent — Interactive CLI for SPD Java
An interactive test harness that runs the original SPD Java game headlessly and communicates via stdin/stdout JSON protocol. Agents can read scene graph, game state, and send click/keyboard input.

- `sdt/test-agent/java/` — Java agent (extends ShatteredPixelDungeon, headless LibGDX)
- `sdt/test-agent/cli/` — TypeScript CLI wrapper (REPL + single commands)
- `sdt/test-agent/protocol.md` — Full protocol spec

```bash
# REPL mode
./sdt/test-agent/sdt-test-agent.sh repl

# Single commands
./sdt/test-agent/sdt-test-agent.sh read --pretty
./sdt/test-agent/sdt-test-agent.sh init TEST-ABC WARRIOR
./sdt/test-agent/sdt-test-agent.sh click 100 200
./sdt/test-agent/sdt-test-agent.sh input SPACE

# Build Java agent (requires Gradle + SPD JARs)
cd sdt/test-agent/java && gradle build
```

**Protocol:** JSON lines over stdin/stdout. Commands: `read`, `click`, `input`, `init`, `wait`, `move`, `attack`, `quit`. The `read` command returns `{game: GameState, scene: SceneGraph}` where scene graph includes all visible elements (Images, BitmapTexts) with their coordinates, textures, and text content.

## Scene Query System — Web Scene Graph Reader
In-browser PixiJS scene graph dumper for Playwright tests. Exposed via `window.__spdQuery` in `main.ts`.
Returns JSON matching the SDT scene graph format (SceneElement[] with id, type, x/y/width/height, textures, text, frame).

```typescript
// In Playwright tests:
import { queryScene, elementsByType, findElement } from './tests/e2e/helpers';
const scene = await queryScene(page);
// scene.type — current scene key ('title'|'heroSelect'|'game')
// scene.elements — flat array of all visible PixiJS display objects
// scene.camera — camera position and zoom
```

- `sdt/web-harness/SceneGraphReader.ts` — walks `app.stage` tree, classifies Sprites→`"Image"`, Text→`"BitmapText"`, Container→`"Group"`
- `tests/e2e/helpers.ts` — Playwright helper: `queryScene()`, `elementsByType()`, `findElement()`, `elementsBySubstring()`
- Saved dumps go to `test-results/scene-*.json`

**Critical:** PixiJS v8 `eventMode` must be `'static'` on ALL ancestor containers up to `renderer.root` for click events to reach interactive children. Currently set on: `renderer.root`, `Camera.container`, each `Scene.container`. If you add a new container layer between stage and interactive elements, set `eventMode: 'static'`.

## Directory Layout
```
src/
├── main.ts                  # Entry point
└── core/
    ├── engine/              # SPDGame, Game, Renderer, Camera
    ├── actors/              # Actor, ActorQueue, Char
    │   ├── mobs/            # Mob + enemies
    │   ├── buffs/           # 87 buffs
    │   └── blobs/           # 22 blobs
    ├── hero/                # Hero, HeroClass, Belongings, Talents
    ├── items/               # Item, Heap, Generator + 358 items
    ├── levels/              # Level, Terrain, Dungeon + rooms
    ├── mechanics/           # Ballistica, ShadowCaster
    ├── rendering/           # DungeonRenderer, FogOfWar, TileAtlas
    ├── sprites/             # SpriteManager + 86 sprite classes
    ├── effects/             # 35 visual effects + particles
    └── utils/               # Random, Point, Bundle (ported from watabou)
sdt/                         # Parity test framework + test agent
│   test-agent/              #   Interactive CLI for testing original SPD Java
│   java-harness/            #   ParityOracle (headless Java game state dumper)
│   web-harness/             #   Web parity tests (Vitest)
│   diff-engine/             #   State comparison engine
│   schema/                  #   Shared types (GameState, TestScript, DiffReport)
│   scripts/                 #   Parity test runners
│   sync-tracker/            #   Porting progress tracker
public/assets/               # Copied SPD assets (sprites, audio, fonts)
```

## Porting Rules
1. **Read Java source first** — use `codegraph query` or open the file directly
2. **Port logic 1:1** — preserve constants, formulas, RNG calls, message keys, sprite IDs
3. **Deterministic RNG** — use `src/core/utils/Random.ts` (seedrandom), never `Math.random()`
4. **PixiJS v8** — `eventMode = 'static'`, no `interactive = true`
5. **TypeScript strict** — no `any`, no unused params, no unchecked index access
6. **Pixel-perfect** — 160×144 virtual res, 16×16 tiles, integer zoom 2-8
7. **GPLv3** — preserve license + attribution for all SPD code/assets
8. **Test parity** — after porting a class, add parity tests to SDT
9. **Port behavior before polish** — effects can be simplified temporarily
10. **Crisp rendering at all times (CRITICAL):**
    - Set `TextureSource.defaultOptions.scaleMode = 'nearest'` before any asset loading
    - Set `roundPixels: true` on renderer init for sub-pixel alignment
    - Set `antialias: false` on renderer init
    - Canvas CSS must have `image-rendering: pixelated`
    - Use `makeText()` from `src/ui/text.ts` for all text — sets `_autoResolution = false` + `resolution = SCALE × DPR` for 1:1 pixel mapping
    - Call `await document.fonts.ready` in `main.ts` before first scene to avoid flash of fallback font
11. **PixiJS v8 rendering quirks:**
    - Call `this.app.stage.addChild(root)` then `root.scale.set(zoom)` for virtual→canvas mapping
    - Use `await Assets.load(path)` for textures (not `Texture.from` — returns zero-size before load)
    - `Application` ticker auto-renders; no need for explicit `app.render()` calls
    - WebGL `getImageData` returns 0s without `preserveDrawingBuffer: true`; use `toDataURL()` or `page.screenshot()` in tests
    - `camera.container` must remain in scene graph as sibling of scene containers, never re-parented

## Key Java → TS Mappings
| Java (com.watabou.utils.*) | TypeScript |
|---------------------------|------------|
| `Random`                  | `src/core/utils/Random.ts` |
| `Point`, `PointF`         | `src/core/utils/Geom.ts` |
| `Rect`, `RectF`           | `src/core/utils/Geom.ts` |
| `Bundle` + `Bundlable`   | `src/core/utils/Bundle.ts` |
| `PathFinder`              | `src/core/utils/PathFinder.ts` |
| `GameMath`                | `src/core/utils/Geom.ts` |
| `Signal`                  | `src/core/utils/Signal.ts` |

| Java (game logic) | TypeScript |
|-------------------|------------|
| `Dungeon.java`    | `src/core/levels/Dungeon.ts` |
| `Level.java`      | `src/core/levels/Level.ts` |
| `Terrain.java`    | `src/core/levels/Terrain.ts` |
| `Actor.java`      | `src/core/actors/Actor.ts` |
| `Char.java`       | `src/core/actors/Char.ts` |
| `Hero.java`       | `src/core/hero/Hero.ts` |
| `Mob.java`        | `src/core/actors/mobs/Mob.ts` |

## Build Verification
```bash
npm test && npm run build           # Before commits
npm run parity                       # After porting new classes
```

## Architecture Notes
- `SPDGame` drives `Renderer` + `SceneManager` + `Game` from `requestAnimationFrame`
- `Game` + `ActorQueue` = turn-based scheduling (lower time first, higher priority first)
- Actor priorities: VFX=100, HERO=0, MOB=-20, BUFF=-30
- Scenes registered by string keys: `'title'`, `'heroSelect'`, `'game'`
- Asset paths match original `core/src/main/assets/` layout
- **Smooth movement:** `CharSprite` has `startMove(fromCell, toCell, mapWidth)` + `updateMove(dt)` with 100ms interpolation; `isBusy` flag blocks input during animation; `onMoveComplete` callback processes mob turns + camera target after sprite arrives
- **Camera:** `centerOn()` only sets target (smooth pan via `update()`); use `snapTo()` / `snapToCell()` for instant positioning (scene init)
