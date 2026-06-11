import { Item } from '../Item';

export abstract class Potion extends Item {
  static readonly AC_DRINK = 'DRINK';

  image = 0;
  icon = -1;
  stackable = true;

  protected anonymous = false;

  constructor() {
    super();
    this.defaultAction = Potion.AC_DRINK;
  }

  abstract effect(): void;

  override actions(): string[] {
    return [...super.actions(), Potion.AC_DRINK];
  }

  override execute(_hero: any, action: string): void {
    super.execute(_hero, action);

    if (action === Potion.AC_DRINK) {
      this.drink(_hero);
    }
  }

  protected drink(hero: any): void {
    this.detach(hero.belongings.backpack);
    this.apply(hero);
  }

  apply(_hero: any): void {
    this.effect();
  }

  isKnown(): boolean {
    return this.anonymous || (this.levelKnown && this.cursedKnown);
  }

  override isIdentified(): boolean {
    return this.isKnown();
  }

  override isUpgradable(): boolean {
    return false;
  }

  override value(): number {
    return 30 * this.itemQuantity;
  }
}
