// Port of com.shatteredpixel.shatteredpixeldungeon.items.food.Food

import { Item } from '../Item';

export abstract class Food extends Item {
  stackable = true;

  abstract energy(): number;
}
