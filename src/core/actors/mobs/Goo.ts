// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Goo

import { Mob, MobState } from './Mob';
import { Char } from '../Char';
import { Int as RandInt } from '../../utils/Random';
import { Dungeon } from '../../levels/Dungeon';

export class Goo extends Mob {
  static readonly GOO_HT = 100;
  static readonly GOO_ATK = 10;

  private pumpedUp = 0;

  constructor() {
    super();
    this.HP = Goo.GOO_HT;
    this.HT = Goo.GOO_HT;
    this.baseAttackSkill = Goo.GOO_ATK;
    this.baseDefenseSkill = 8;
    this.EXP = 10;

    this._properties.add('BOSS');
    this._properties.add('DEMONIC');
    this._properties.add('ACIDIC');
  }

  act(): boolean {
    if (this.state !== MobState.HUNTING && this.pumpedUp > 0) {
      this.pumpedUp = 0;
    }
    return this.actAI();
  }

  damageRoll(): number {
    const min = 1;
    const max = (this.HP * 2 <= this.HT) ? 12 : 8;
    if (this.pumpedUp > 0) {
      this.pumpedUp = 0;
      return min * 3 + RandInt(max * 3 + 1 - min * 3);
    }
    return min + RandInt(max + 1 - min);
  }

  attackSkill(_target: Char): number {
    let atk = 10;
    if (this.HP * 2 <= this.HT) atk = 15;
    if (this.pumpedUp > 0) atk *= 2;
    return atk;
  }

  defenseSkill(_target: Char): number {
    const mult = (this.HP * 2 <= this.HT) ? 1.5 : 1;
    return Math.floor(super.defenseSkill(_target) * mult);
  }

  drRoll(): number {
    return super.drRoll() + RandInt(3);
  }

  canAttack(enemy: Char): boolean {
    if (this.pumpedUp > 0) {
      const level = Dungeon.level;
      if (!level) return false;
      const dist = level.cellToPoint(this.pos);
      const enemyP = level.cellToPoint(enemy.pos);
      return Math.abs(dist.x - enemyP.x) <= 2 && Math.abs(dist.y - enemyP.y) <= 2;
    }
    return super.canAttack(enemy);
  }

  doAttack(enemy: Char): boolean {
    return this.attack(enemy);
  }
}
