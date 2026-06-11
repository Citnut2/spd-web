// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm

import { Mob } from './Mob';
import { Char } from '../Char';
import { Int as RandInt, element } from '../../utils/Random';
import { Dungeon } from '../../levels/Dungeon';

export class Swarm extends Mob {
  static readonly SWARM_HT = 50;
  static readonly SWARM_ATK = 10;
  static readonly SWARM_DEF = 5;

  generation = 0;

  constructor() {
    super();
    this.HP = Swarm.SWARM_HT;
    this.HT = Swarm.SWARM_HT;
    this.baseAttackSkill = Swarm.SWARM_ATK;
    this.baseDefenseSkill = Swarm.SWARM_DEF;
    this.EXP = 3;
    this.maxLvl = 9;
    this.flying = true;
    this.lootChance = 0.1667;
  }

  act(): boolean {
    if (this.generation > 0) this.EXP = 0;
    return this.actAI();
  }

  damageRoll(): number {
    return 1 + RandInt(4);
  }

  attackSkill(_target: Char): number {
    return this.baseAttackSkill;
  }

  /** Split on damage if HP is high enough */
  defenseProc(_enemy: Char, damage: number): number {
    if (this.HP >= damage + 2) {
      const level = Dungeon.level;
      if (level) {
        const neighbours = level.getNeighbours4(this.pos);
        const candidates: number[] = [];
        for (const n of neighbours) {
          if (!level.solid[n] && (level.passable[n] || level.avoid[n])) {
            candidates.push(n);
          }
        }
        if (candidates.length > 0) {
          const clone = new Swarm();
          clone.generation = this.generation + 1;
          clone.EXP = 0;
          clone.pos = element(candidates);
          clone.state = this.state;
          clone.HP = Math.floor((this.HP - damage) / 2);
          this.HP -= clone.HP;
        }
      }
    }
  return super.defenseProc(_enemy, damage);
  }
}