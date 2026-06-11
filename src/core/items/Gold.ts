// Port of com.shatteredpixel.shatteredpixeldungeon.items.Gold

import { Item } from './Item';

export class Gold extends Item {
  image = 0;
  stackable = true;

  name(): string {
    return 'Gold';
  }
}
