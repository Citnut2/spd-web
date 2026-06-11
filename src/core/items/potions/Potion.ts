// Port of com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion

import { Item } from '../Item';

export abstract class Potion extends Item {
  image = 0;
  stackable = true;

  abstract effect(): void;
}
