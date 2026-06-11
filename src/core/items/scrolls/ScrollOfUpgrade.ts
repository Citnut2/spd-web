import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfUpgrade extends Scroll {
  image = ItemSpriteSheet.SCROLL_KAUNAN;

  doRead(): void {
    // stub
  }

  value(): number {
    return 50 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Upgrade';
  }
}
