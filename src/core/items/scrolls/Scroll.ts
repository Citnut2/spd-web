import { Hero } from '../../hero/Hero';
import { Item } from '../Item';

export abstract class Scroll extends Item {
  static readonly AC_READ = 'READ';
  static readonly TIME_TO_READ = 1;

  image = 0;
  stackable = true;

  constructor() {
    super();
    this.defaultAction = Scroll.AC_READ;
  }

  abstract doRead(): void;

  actions(hero: Hero): string[] {
    const actions = super.actions(hero);
    actions.push(Scroll.AC_READ);
    return actions;
  }

  execute(hero: Hero, action: string): void {
    super.execute(hero, action);
    if (action === Scroll.AC_READ) {
      this.doRead();
    }
  }

  isKnown(): boolean {
    return this.isIdentified();
  }

  setKnown(): void {
    this.identify();
  }

  identify(): Item {
    super.identify();
    return this;
  }

  isIdentified(): boolean {
    return this.isKnown();
  }

  isUpgradable(): boolean {
    return false;
  }

  value(): number {
    return 30 * this.itemQuantity;
  }

  energyVal(): number {
    return 6 * this.itemQuantity;
  }
}
