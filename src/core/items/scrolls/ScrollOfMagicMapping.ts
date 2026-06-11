import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfMagicMapping extends Scroll {
  image = ItemSpriteSheet.SCROLL_YNGVI;

  doRead(): void {
    // stub
  }

  value(): number {
    return 40 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Magic Mapping';
  }
}
