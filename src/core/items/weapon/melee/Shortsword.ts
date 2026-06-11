// Port of com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Shortsword

import { MeleeWeapon } from './MeleeWeapon';

export class Shortsword extends MeleeWeapon {
  image = 0;

  constructor() {
    super();
    this._tier = 2;
  }
}
