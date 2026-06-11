import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfTeleportation extends Scroll {
  image = ItemSpriteSheet.SCROLL_ISAZ;

  doRead(): void {
    // stub
  }

  value(): number {
    return 30 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Teleportation';
  }
}
