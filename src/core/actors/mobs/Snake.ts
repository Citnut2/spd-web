// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake

import { Mob } from './Mob';
import { Char } from '../Char';
import { Int as RandInt } from '../../utils/Random';

export class Snake extends Mob {
  static readonly SNAKE_HT = 4;
  static readonly SNAKE_ATK = 10;
  static readonly SNAKE_DEF = 25;

  constructor() {
    super();
    this.HP = Snake.SNAKE_HT;
    this.HT = Snake.SNAKE_HT;
    this.baseAttackSkill = Snake.SNAKE_ATK;
    this.baseDefenseSkill = Snake.SNAKE_DEF;
    this.EXP = 2;
    this.maxLvl = 7;
    this.lootChance = 0.25;
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
}
