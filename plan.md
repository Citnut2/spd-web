# SPD Clone — Porting Roadmap

**Goal:** Full port of Shattered Pixel Dungeon v3.3.5 from Java/LibGDX → TypeScript/PixiJS 8.

**Status:** Rendering/Engine/Utils ≈95% done. Content (items, levels, mobs, buffs) ≈15% done.

---

## Phase 1 — Core Systems ✅

| Step | Files | Status |
|------|-------|--------|
| **Items base** | `src/core/items/Item.ts`, `Bag.ts`, `Heap.ts`, `Generator.ts` | ✅ Done |
| **Mechanics** | `src/core/mechanics/Ballistica.ts`, `ShadowCaster.ts` | ✅ Done |
| **Buffs framework** | `src/core/actors/buffs/Buff.ts`, `FlavourBuff.ts`, `CounterBuff.ts`, `ShieldBuff.ts`, `AllyBuff.ts` | ✅ Done |

## Phase 2 — Core Gameplay Loop ✅

| Step | Status |
|------|--------|
| **Mob AI** — pathfinding integration, state machine (sleep/wander/hunt/flee) | ✅ Done |
| **Chapter-1 mobs + sprites** — Rat, Slime, Gnoll, Snake, Crab, Swarm, Albino, Goo (boss) | ✅ Done |
| **Hero Belongings** — `Belongings.ts` with Backpack, equipment slots, iterator | ✅ Done |
| **Starting items** — Weapon/MeleeWeapon/Armor base classes, Dagger, Shortsword, WornShortsword, ClothArmor, LeatherArmor, Gold, Food, MysteryMeat, PotionOfHealing, ScrollOfUpgrade | ✅ Done |
| **Depth transitions** — `Dungeon.goDown()`, `newLevel()`, `initHero()` wiring | ✅ Done |
| **Generator updates** — category-to-class mappings for chapter-1 items | ✅ Done |

## Phase 3 — Content Expansion

| Step | Status |
|------|--------|
| **Level rooms system** — `src/core/levels/rooms/` with painters/builders/room types | 🔲 Not started |
| Remaining chapter-1 items (unidentified potions/scrolls, wands, rings, artifacts) | 🔲 Not started |
| All 5 chapters' levels: Prison, Caves, City, Halls + bosses | 🔲 Not started |
| All ~50 mob types + sprites | 🔲 Not started |
| All ~350 items | 🔲 Not started |
| All ~87 buffs | 🔲 Not started |
| All ~22 blobs | 🔲 Not started |
| All ~35 effects | 🔲 Not started |

## Phase 4 — UI & Feature Polish

| Step | Status |
|------|--------|
| Inventory screen (bag window, equip, use, drop) | 🔲 Not started |
| Quick slots + quickswap | 🔲 Not started |
| Talent tree | 🔲 Not started |
| Shops / merchants | 🔲 Not started |
| Alchemy system | 🔲 Not started |
| Quests (ghost, imp, wandmaker) | 🔲 Not started |
| Save/load via Bundle | 🔲 Not started |
| Sound / music | 🔲 Not started |
| Mouse/touch input for movement | 🔲 Not started |
| Game over screen + replay | 🔲 Not started |
| Interactable tiles (traps, grass, wells, doors, altars) | 🔲 Not started |

## Phase 5 — Parity & Hardening

| Step | Status |
|------|--------|
| Deterministic RNG audit — verify all `Math.random()` replaced with `Random.ts` | 🔲 Not started |
| SDT parity tests for combat, levels, items, buffs | 🔲 Not started |
| Edge cases — death, zero-HP, overflow, fov during mob turns | 🔲 Not started |
| Performance — sprite pooling, tile batching, particles | 🔲 Not started |
