// Port of com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade

import { Scroll } from './Scroll';

export class ScrollOfUpgrade extends Scroll {
  image = 0;

  effect(): void {
    // Upgrade a random item
  }

  name(): string {
    return 'Scroll of Upgrade';
  }
}
