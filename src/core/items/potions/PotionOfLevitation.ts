import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfLevitation extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_LEVITATE;

  effect(): void {
    // apply: Buff.prolong(hero, Levitation.class, Levitation.DURATION)
    // shatter: ConfusionGas blob at cell
  }

  value(): number {
    return this.isKnown() ? 40 * this.itemQuantity : super.value();
  }

  name(): string {
    return 'Potion of Levitation';
  }
}
