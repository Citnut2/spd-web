import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfTerror extends Scroll {
  image = ItemSpriteSheet.SCROLL_NAUDIZ;

  doRead(): void {
    // stub
  }

  value(): number {
    return 40 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Terror';
  }
}
