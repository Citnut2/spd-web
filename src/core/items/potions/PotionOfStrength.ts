import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfStrength extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_STRENGTH;

  unique = true;

  effect(): void {
    // +1 STR, FloatingText.STRENGTH, Badges
  }

  value(): number {
    return this.isKnown() ? 50 * this.itemQuantity : super.value();
  }

  energyVal(): number {
    return this.isKnown() ? 10 * this.itemQuantity : super.energyVal();
  }

  name(): string {
    return 'Potion of Strength';
  }
}
