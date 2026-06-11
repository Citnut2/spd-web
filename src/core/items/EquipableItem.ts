// Port of com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem

import { Item } from './Item';
import type { Hero } from '../hero/Hero';
import { GLog } from '../../ui/GLog';

export abstract class EquipableItem extends Item {
  abstract doEquip(hero: Hero): boolean;

  doUnequip(hero: Hero, single = false): boolean {
    if (single && this.itemQuantity > 1) {
      const split = this.split(1);
      if (split) {
        const unequipped = hero.belongings.backpack.items.includes(split);
        if (unequipped) {
          GLog.add(`@@Unequipped ${this.name()}`);
          return true;
        }
      }
      return false;
    }
    GLog.add(`@@Unequipped ${this.name()}`);
    return true;
  }
}
