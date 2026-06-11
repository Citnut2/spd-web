# Porting Sync Status

**Last updated:** 2026-06-11T11:50:00Z
**Test seed:** TEST-ABC
**Hero:** WARRIOR

## Test Results

| Seed | Hero | Depth | Actions | Web Determinism | Java Parity |
|------|------|-------|---------|----------------|-------------|
| TEST-ABC | WARRIOR | 1 | `wait=2 move=0,-1 move=-1,0` | ✅ | ✅ (cached) |
| RAT-SLAYER | WARRIOR | 1 | `wait=3 move=1,0 wait=5` | ✅ | ⏳ (no Java dump) |

## Porting Progress

### Items (Phase 2) — In Progress
| Category | Ported / Total | Status |
|----------|---------------|--------|
| Generator (deck-based Cat system) | ✅ | Full rewrite with per-category RNG seeds |
| Potions | 12 / 12 | ✅ All ported |
| Scrolls | 12 / 12 | ✅ All ported |
| Wands | 1 / 13 | 🔲 (base + WandOfMagicMissile done) |
| Rings | 2 / 12 | 🔲 (base + Accuracy/Evasion done) |
| Artifacts | 0 / 13 | 🔲 (base class done) |
| Melee weapons | 4 / 25 | 🔲 (T1-T2 base, T3-T5 pending) |
| Armor | 2 / 9 | 🔲 (Cloth + Leather done) |
| Missile weapons | 0 / 16 | 🔲 |
| Food | 1 / 3 | 🔲 |
| Item sprites | ✅ | ItemSpriteSheet (~500 constants) + ItemSprite |
| Level item spawning | ✅ | Generator.random() → Level.drop() in createItems() |

### Buffs (Phase 4) — In Progress
| Category | Ported / Total | Status |
|----------|---------------|--------|
| Base system (Buff, FlavourBuff, CounterBuff, ShieldBuff, AllyBuff) | ✅ | Full port with static API |
| Concrete buffs | 15 / 87 | Burning, Frost, Chill, Poison, Paralysis, Haste, Invisibility, Levitation, MindVision, Bless, Amok, Terror, MagicalSleep, Hunger, Regeneration |

### Dungeon Content (Phase 3) — In Progress
| Category | Ported / Total | Status |
|----------|---------------|--------|
| Special rooms | 10 / 24 | Painted, TODO stubs for items/keys/NPCs |
| Standard room subtypes | 0 / ~40 | 🔲 (inline EmptyRoom only) |
| Connection room subtypes | 0 / 7 | 🔲 (TunnelConnectionRoom stub) |
| Level types | 1 / 16 | SewerLevel only |
| Boss levels | 0 / 5 | 🔲 |
| Traps | 0 / ~20 | 🔲 (empty arrays) |
| Shops | 0 / 1 | 🔲 (shopOnLevel returns false) |
| Enemies | 2 / 85 | Rat + Slime |

### Build & Tests
- `tsc --noEmit` → **0 errors**
- `npm test` → **87 / 88 pass** (1 pre-existing: TEST-ABC Java parity requires ParityOracle.jar)
- `vite build` → **success** (522 KiB)

## Notes
- Java harness requires JDK 11+ and compiled SPD JARs
- Web harness validates determinism (same seed → same state)
- Full parity compares Java vs Web state arrays
- Generator uses deck-based probability with separate RNG seeds per category

## Mismatches
- TEST-ABC deterministic: ✅ (passes)
- RAT-SLAYER deterministic: ✅ (passes)
- TEST-ABC vs Java: requires ParityOracle.jar (not cached)
