// Port of com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing

import { Potion } from './Potion';

export class PotionOfHealing extends Potion {
  image = 0;

  effect(): void {
    // Heal the hero
  }

  name(): string {
    return 'Potion of Healing';
  }
}
