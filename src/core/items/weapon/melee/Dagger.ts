// Port of com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Dagger

import { MeleeWeapon } from './MeleeWeapon';
import type { Hero } from '../../../hero/Hero';
import { IntRange } from '../../../utils/Random';

export class Dagger extends MeleeWeapon {
  image = 0;

  constructor() {
    super();
    this._tier = 1;
    this.bones = false;
  }

  max(lvl: number): number {
    return 4 * (this._tier + 1) + lvl * (this._tier + 1);
  }

  damageRoll(owner?: Hero): number {
    if (owner) {
      const diff = this.max(this.trueLevel()) - this.min(this.trueLevel());
      const min = this.min(this.trueLevel()) + Math.round(diff * 0.75);
      const max = this.max(this.trueLevel());
      return IntRange(min, max);
    }
    return super.damageRoll(owner);
  }
}
