// Port of com.shatteredpixel.shatteredpixeldungeon.Dungeon

import { Hero, HeroClass } from '../hero/Hero';
import { Level } from './Level';
import { SewerLevel } from './SewerLevel';
import { pushGenerator, popGenerator, Long } from '../utils/Random';
import { Generator } from '../items/Generator';
import { LevelRef } from './LevelRef';

export class Dungeon {
  static hero: Hero;
  static level: Level;
  static depth = 1;
  static branch = 0;
  static seed: number;
  static gold = 0;
  static energy = 0;
  static customSeedText = '';

  // Items that will be placed in the level during generation
  static itemsToSpawn: any[] = [];

  // Mob spawning tracking
  static mobsToChampion = 0;

  // Limited drops tracking
  static LimitedDrops = {
    SWARM_HP: { count: 0 },
    SLIME_WEP: { count: 0 },
    LAB_ROOM: { count: 0 },
  };

  static init(): void {
    Generator.init();
    Generator.fullReset();

    Dungeon.depth = 1;
    Dungeon.gold = 0;
    Dungeon.energy = 0;
    Dungeon.itemsToSpawn = [];
    Dungeon.hero = new Hero(HeroClass.WARRIOR);
  }

  static initHero(heroClass: HeroClass): void {
    Generator.init();
    Generator.fullReset();

    Dungeon.depth = 1;
    Dungeon.gold = 0;
    Dungeon.energy = 0;
    Dungeon.itemsToSpawn = [];
    Dungeon.hero = new Hero(heroClass);
  }

  // Check if shop should be on current level
  static shopOnLevel(): boolean {
    // Simplified: no shops on depth 1
    return false;
  }

  static seedCurDepth(): number {
    return Dungeon.seedForDepth(Dungeon.depth, Dungeon.branch);
  }

  static seedForDepth(depth: number, branch: number): number {
    let lookAhead = depth + 30 * branch;
    pushGenerator(Dungeon.seed);
    for (let i = 0; i < lookAhead; i++) {
      Long();
    }
    const result = Long();
    popGenerator();
    return result;
  }

  static newLevel(): Level {
    pushGenerator(Dungeon.seedCurDepth());

    let level: Level;
    switch (Dungeon.depth) {
      case 1:
      case 2:
      case 3:
      case 4:
        level = new SewerLevel();
        break;
      case 5:
        level = new SewerLevel();
        break;
      default:
        level = new SewerLevel();
    }

    level.create();
    popGenerator();

    Dungeon.level = level;
    LevelRef.current = level;

    // Place hero at level entrance
    if (Dungeon.hero) {
      Dungeon.hero.pos = level.entrance;
    }

    return level;
  }

  static goDown(): void {
    Dungeon.depth++;
    Dungeon.itemsToSpawn = [];
    Dungeon.newLevel();
  }

  static bossLevel(): boolean;
  static bossLevel(depth: number): boolean;
  static bossLevel(depth?: number): boolean {
    const d = depth ?? Dungeon.depth;
    return d === 5 || d === 10 || d === 15 || d === 20 || d === 25;
  }

  static labRoomNeeded(): boolean {
    const region = 1 + Math.floor(Dungeon.depth / 5);
    if (region > Dungeon.LimitedDrops.LAB_ROOM.count) {
      const floorThisRegion = Dungeon.depth % 5;
      if (floorThisRegion >= 4 || (floorThisRegion === 3)) {
        return true;
      }
    }
    return false;
  }

  static isChallenged(_challenge: number): boolean {
    return false;
  }

  static observe(): void {
    // Update FOV, sprite visibility, etc.
    if (Dungeon.level) {
      Dungeon.level.updateFieldOfView();
    }
  }
}
