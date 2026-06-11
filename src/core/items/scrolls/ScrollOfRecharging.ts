import { Scroll } from './Scroll';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class ScrollOfRecharging extends Scroll {
  image = ItemSpriteSheet.SCROLL_RAIDO;

  doRead(): void {
    // stub
  }

  value(): number {
    return 30 * this.itemQuantity;
  }

  name(): string {
    return 'Scroll of Recharging';
  }
}
