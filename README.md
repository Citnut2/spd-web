# spd-clone

Web port of **Shattered Pixel Dungeon** v3.3.5 from Java/LibGDX to TypeScript/PixiJS 8.

## Quick Start

```bash
npm install
npm run dev          # Vite dev server → localhost:5174
npm test             # Vitest unit tests + SDT parity tests
npm run build        # tsc && vite build
```

## Architecture

```
src/
├── main.ts                  # Entry point
├── core/
│   ├── engine/              # SPDGame, Game, Renderer, Camera
│   ├── actors/              # Actor, ActorQueue, Char
│   │   ├── mobs/            # Mob + enemy classes
│   │   ├── buffs/           # Buff framework + concrete buffs
│   │   └── blobs/           # Area-effect blobs
│   ├── hero/                # Hero, HeroClass, Belongings, Talents
│   ├── items/               # Item, Heap, Generator + subclasses
│   ├── levels/              # Level, Terrain, Dungeon + rooms
│   ├── mechanics/           # Ballistica, ShadowCaster
│   ├── rendering/           # DungeonRenderer, FogOfWar, TileAtlas
│   ├── sprites/             # SpriteManager + character sprites
│   ├── effects/             # Visual effects + particles
│   └── utils/               # Random, Point, Bundle (ported from watabou)
sdt/                         # SDT parity test framework + test agent
public/assets/               # SPD assets (sprites, audio, fonts)
```

## Porting Status

- **Engine/Rendering/Utils:** ≈95%
- **Content (items, mobs, buffs, levels):** ≈15%
- **SDT parity tests:** 87/88 passing (1 pre-existing mismatch)

## License

GPLv3 — preserves SPD licensing for all ported code and assets.
