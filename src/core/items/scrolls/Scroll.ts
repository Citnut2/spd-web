// Port of com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll

import { Item } from '../Item';

export abstract class Scroll extends Item {
  image = 0;
  stackable = true;

  abstract effect(): void;
}
