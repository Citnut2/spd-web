// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Slime

import { Mob } from './Mob';
import { Int as RandInt } from '../../utils/Random';

export class Slime extends Mob {
  static readonly SLIME_HT = 20;
  static readonly SLIME_ATK = 12;
  static readonly SLIME_DEF = 5;

  constructor() {
    super();
    this.HP = Slime.SLIME_HT;
    this.HT = Slime.SLIME_HT;
    this.baseAttackSkill = Slime.SLIME_ATK;
    this.baseDefenseSkill = Slime.SLIME_DEF;
    this.EXP = 4;
    this.maxLvl = 9;
    this.maxLoot = 1;
    this.lootChance = 0.2;
  }

  act(): boolean {
    return this.actAI();
  }

  damageRoll(): number {
    return 2 + RandInt(4);
  }
}
