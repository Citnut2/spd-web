import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfInvisibility extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_INVIS;

  effect(): void {
    // Buff.prolong(hero, Invisibility.class, Invisibility.DURATION)
  }

  value(): number {
    return this.isKnown() ? 40 * this.itemQuantity : super.value();
  }

  name(): string {
    return 'Potion of Invisibility';
  }
}
