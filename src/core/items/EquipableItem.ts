// Port of com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem

import { Item } from './Item';
import type { Hero } from '../hero/Hero';
import { GLog } from '../../ui/GLog';

export abstract class EquipableItem extends Item {
  static readonly AC_EQUIP = 'EQUIP';
  static readonly AC_UNEQUIP = 'UNEQUIP';

  override defaultAction: string | null = EquipableItem.AC_EQUIP;

  abstract doEquip(hero: Hero): boolean;

  override actions(hero: Hero): string[] {
    const acts = super.actions(hero);
    if (hero.belongings.backpack.items.includes(this)) {
      acts.push(EquipableItem.AC_EQUIP);
    } else {
      acts.push(EquipableItem.AC_UNEQUIP);
    }
    return acts;
  }

  override execute(hero: Hero, action: string): void {
    super.execute(hero, action);
    if (action === EquipableItem.AC_EQUIP) {
      this.doEquip(hero);
    } else if (action === EquipableItem.AC_UNEQUIP) {
      this.doUnequip(hero);
    }
  }

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
