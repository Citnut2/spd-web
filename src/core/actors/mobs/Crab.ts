// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab

import { Mob } from './Mob';
import { Char } from '../Char';
import { Int as RandInt } from '../../utils/Random';

export class Crab extends Mob {
  static readonly CRAB_HT = 15;
  static readonly CRAB_ATK = 12;
  static readonly CRAB_DEF = 5;

  constructor() {
    super();
    this.HP = Crab.CRAB_HT;
    this.HT = Crab.CRAB_HT;
    this.baseAttackSkill = Crab.CRAB_ATK;
    this.baseDefenseSkill = Crab.CRAB_DEF;
    this.baseSpeed = 2;
    this.EXP = 4;
    this.maxLvl = 9;
    this.lootChance = 0.167;
  }

  act(): boolean {
    return this.actAI();
  }

  damageRoll(): number {
    return 1 + RandInt(7);
  }

  attackSkill(_target: Char): number {
    return this.baseAttackSkill;
  }

  drRoll(): number {
    return super.drRoll() + RandInt(5);
  }
}
