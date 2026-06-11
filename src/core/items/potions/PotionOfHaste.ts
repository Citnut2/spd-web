import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfHaste extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_HASTE;

  effect(): void {
    // Buff.prolong(hero, Haste.class, Haste.DURATION)
  }

  value(): number {
    return this.isKnown() ? 40 * this.itemQuantity : super.value();
  }

  name(): string {
    return 'Potion of Haste';
  }
}
