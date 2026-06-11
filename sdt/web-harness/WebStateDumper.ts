// Port of com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed
// Used for parity testing: dumps game state in same format as Java ParityOracle

import { Dungeon } from '../../src/core/levels/Dungeon';
import { Actor } from '../../src/core/actors/Actor';
import { Mob } from '../../src/core/actors/mobs/Mob';
import type { GameState, HeroState, LevelState, MobState, HeapState } from '../schema/GameState';
import type { Action, TestScript, Direction } from '../schema/TestScript';
import * as Random from '../../src/core/utils/Random';

export class WebStateDumper {
  private script: TestScript;
  private turn = 0;
  private actionIndex = 0;
  private hero: HeroState | null = null;
  private level: LevelState | null = null;

  constructor(script: TestScript) {
    this.script = script;
  }

  private convertSeed(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h) + seed.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  initGame(): void {
    Actor.resetNextID();
    Dungeon.seed = this.convertSeed(this.script.seed);

    Random.resetGenerators();
    Random.pushGenerator(Dungeon.seed);

    Dungeon.init();
    Dungeon.newLevel();
    Dungeon.hero.pos = Dungeon.level.entrance;

    this.readState();
  }

  private readState(): void {
    const hero = Dungeon.hero;
    const level = Dungeon.level;

    this.hero = {
      pos: hero.pos,
      HP: hero.HP,
      HT: hero.HT,
      STR: hero.STR,
      class: hero.heroClass as string,
      level: hero.lvl,
      XP: hero.exp,
      weapon: null,
      armor: null,
      ring: null,
      artifact: null,
      inventory: []
    };

    const mobs: MobState[] = [];
    for (const actor of level.mobs) {
      if (actor instanceof Mob) {
        mobs.push({
          id: actor.id,
          type: actor.constructor.name,
          pos: actor.pos,
          HP: actor.HP,
          HT: actor.HT,
          alignment: actor.alignment as 'ENEMY' | 'NEUTRAL' | 'ALLY',
          state: 'SLEEPING'
        });
      }
    }

    const heaps: HeapState[] = [];
    for (const h of level.heaps.values()) {
      heaps.push({
        pos: h.pos,
        items: h.items.map(item => ({
          type: item.constructor.name,
          quantity: item.itemQuantity
        }))
      });
    }

    this.level = {
      width: level.width,
      height: level.height,
      terrain: level.map.slice(),
      mobs,
      heaps,
      entrance: level.entrance,
      exit: level.exit
    };
  }

  executeAction(action: Action): void {
    if (!this.hero || !this.level) return;

    switch (action.t) {
      case 'wait':
        this.turn += action.turns;
        break;
      case 'move': {
        const newPos = this.computeNewPos(this.hero.pos, action.dir);
        if (newPos !== this.hero.pos) {
          this.hero.pos = newPos;
          Dungeon.hero.pos = newPos;
        }
        this.turn++;
        break;
      }
      case 'attack':
        this.turn++;
        break;
      case 'pickup':
        this.pickupItems();
        this.turn++;
        break;
      case 'rest':
        this.turn += action.turns;
        break;
    }

    this.readState();
  }

  private computeNewPos(pos: number, dir: Direction): number {
    const level = Dungeon.level;
    const w = level.width;
    const x = pos % w + dir.x;
    const y = Math.floor(pos / w) + dir.y;
    if (x < 0 || x >= w || y < 0 || y >= level.height) return pos;
    const newPos = y * w + x;
    if (level.passable[newPos]) return newPos;
    return pos;
  }

  private pickupItems(): void {
    const pos = Dungeon.hero.pos;
    const heap = Dungeon.level.heaps.get(pos);
    if (heap) {
      for (const item of heap.items) {
        if (this.hero) {
          this.hero.inventory.push({
            type: item.constructor.name,
            quantity: item.itemQuantity
          });
        }
      }
      heap.destroy();
    }
  }

  dump(checkpoint: string): GameState {
    return {
      seed: this.script.seed,
      depth: Dungeon.depth,
      turn: this.turn,
      hero: this.hero!,
      level: this.level!,
      rngCalls: 0,
      checkpoint
    };
  }

  async run(): Promise<GameState[]> {
    this.initGame();
    const states: GameState[] = [];

    const initCp = this.script.checkpoints.find(
      c => c.when === 'action' && c.index === 0
    );
    if (initCp) {
      states.push(this.dump(initCp.label));
    }

    const actions = this.script.actions;
    for (let i = 0; i < actions.length; i++) {
      this.executeAction(actions[i]!);
      this.actionIndex = i + 1;

      for (const cp of this.script.checkpoints) {
        if (cp.when === 'action' && cp.index === this.actionIndex) {
          states.push(this.dump(cp.label));
        }
      }

      for (const cp of this.script.checkpoints) {
        if (cp.when === 'turn' && cp.value === this.turn) {
          states.push(this.dump(cp.label));
        }
      }

      if (this.turn >= this.script.maxTurns) break;
    }

    const endCp = this.script.checkpoints.find(c => c.when === 'end');
    if (endCp) {
      states.push(this.dump(endCp.label));
    }

    return states;
  }
}
