import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfRetribution extends Scroll {
  image = ItemSpriteSheet.SCROLL_BERKANAN;

  doRead(): void {
    // stub
  }

  value(): number {
    return 40 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Retribution';
  }
}
