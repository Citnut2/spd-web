import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfLullaby extends Scroll {
  image = ItemSpriteSheet.SCROLL_MANNAZ;

  doRead(): void {
    // stub
  }

  value(): number {
    return 40 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Lullaby';
  }
}
