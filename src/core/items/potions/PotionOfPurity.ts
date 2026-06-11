import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfPurity extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_PURITY;

  effect(): void {
    // apply: Buff.prolong(hero, BlobImmunity.class, BlobImmunity.DURATION)
    // shatter: clears harmful blobs in radius
  }

  value(): number {
    return this.isKnown() ? 40 * this.itemQuantity : super.value();
  }

  name(): string {
    return 'Potion of Purity';
  }
}
