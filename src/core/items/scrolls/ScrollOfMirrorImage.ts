import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfMirrorImage extends Scroll {
  image = ItemSpriteSheet.SCROLL_TIWAZ;

  doRead(): void {
    // stub
  }

  value(): number {
    return 30 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Mirror Image';
  }
}
