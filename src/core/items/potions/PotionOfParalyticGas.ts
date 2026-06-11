import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfParalyticGas extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_PARAGAS;

  effect(): void {
    // shatter at hero pos: ParalyticGas blob
  }

  value(): number {
    return this.isKnown() ? 40 * this.itemQuantity : super.value();
  }

  name(): string {
    return 'Potion of Paralytic Gas';
  }
}
