// Port of com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WornShortsword

import { MeleeWeapon } from './MeleeWeapon';

export class WornShortsword extends MeleeWeapon {
  image = 0;

  constructor() {
    super();
    this._tier = 1;
    this.bones = false;
  }
}
