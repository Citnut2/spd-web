import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfRage extends Scroll {
  image = ItemSpriteSheet.SCROLL_GYFU;

  doRead(): void {
    // stub
  }

  value(): number {
    return 40 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Rage';
  }
}
