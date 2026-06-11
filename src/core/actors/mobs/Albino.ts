// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Albino

import { Rat } from './Rat';
import { Char } from '../Char';
import { Int as RandInt } from '../../utils/Random';

export class Albino extends Rat {
  constructor() {
    super();
    this.HP = 12;
    this.HT = 12;
    this.EXP = 2;
    this.lootChance = 1;
  }

  attackProc(_enemy: Char, damage: number): number {
    if (damage > 0 && RandInt(2) === 0) {
      // Would apply Bleeding buff
      // Buff.affect(enemy, Bleeding.class).set(Random.NormalFloat(2, 3));
    }
    return damage;
  }
}
