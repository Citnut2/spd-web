// Port of com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat

import { Food } from './Food';

export class MysteryMeat extends Food {
  image = 0;
  stackable = true;

  energy(): number {
    return 75;
  }

  name(): string {
    return 'Mystery Meat';
  }
}
