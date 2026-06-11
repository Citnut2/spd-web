import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfIdentify extends Scroll {
  image = ItemSpriteSheet.SCROLL_SOWILO;

  doRead(): void {
    // stub
  }

  value(): number {
    return 30 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Identify';
  }
}
