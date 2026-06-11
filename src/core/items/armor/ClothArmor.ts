// Port of com.shatteredpixel.shatteredpixeldungeon.items.armor.ClothArmor

import { Armor } from './Armor';

export class ClothArmor extends Armor {
  image = 0;
  tier = 1;

  constructor() {
    super();
    this.bones = false;
  }
}
