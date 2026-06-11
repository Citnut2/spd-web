// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat

import { Mob, MobState } from './Mob';
import { Char } from '../Char';
import { Int as RandInt } from '../../utils/Random';

export class Rat extends Mob {
  static readonly RAT_HT = 8;
  static readonly RAT_ATK = 6;
  static readonly RAT_DEF = 2;

  constructor() {
    super();
    this.HP = Rat.RAT_HT;
    this.HT = Rat.RAT_HT;
    this.baseAttackSkill = Rat.RAT_ATK;
    this.baseDefenseSkill = Rat.RAT_DEF;
    this.EXP = 1;
    this.maxLoot = 0;
    this.state = MobState.WANDERING;
  }

  act(): boolean {
    return this.actAI();
  }

  damageRoll(): number {
    return 1 + RandInt(4);
  }

  attackSkill(_target: Char): number {
    return this.baseAttackSkill;
  }

  defenseSkill(_target: Char): number {
    return this.baseDefenseSkill;
  }
}
