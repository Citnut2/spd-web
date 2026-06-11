// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Gnoll

import { Mob } from './Mob';
import { Char } from '../Char';
import { Int as RandInt } from '../../utils/Random';

export class Gnoll extends Mob {
  static readonly GNOLL_HT = 12;
  static readonly GNOLL_ATK = 10;
  static readonly GNOLL_DEF = 4;

  constructor() {
    super();
    this.HP = Gnoll.GNOLL_HT;
    this.HT = Gnoll.GNOLL_HT;
    this.baseAttackSkill = Gnoll.GNOLL_ATK;
    this.baseDefenseSkill = Gnoll.GNOLL_DEF;
    this.EXP = 2;
    this.maxLvl = 8;
    this.lootChance = 0.5;
  }

  act(): boolean {
    return this.actAI();
  }

  damageRoll(): number {
    return 1 + RandInt(6);
  }

  attackSkill(_target: Char): number {
    return this.baseAttackSkill;
  }

  drRoll(): number {
    return super.drRoll() + RandInt(3);
  }
}
