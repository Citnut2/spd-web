// Port of com.shatteredpixel.shatteredpixeldungeon.items.KindOfWeapon

import { EquipableItem } from './EquipableItem';
import type { Hero } from '../hero/Hero';

export abstract class KindOfWeapon extends EquipableItem {
  abstract damageRoll(owner: Hero): number;
  abstract accuracyFactor(owner: Hero): number;
  abstract delayFactor(owner: Hero): number;
  abstract reachFactor(owner: Hero): number;
  abstract defenseFactor(owner: Hero): number;
}
