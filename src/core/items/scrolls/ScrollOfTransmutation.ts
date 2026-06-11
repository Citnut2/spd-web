import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfTransmutation extends Scroll {
  image = ItemSpriteSheet.SCROLL_ODAL;

  doRead(): void {
    // stub
  }

  value(): number {
    return 50 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Transmutation';
  }
}
