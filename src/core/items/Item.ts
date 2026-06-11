import { GLog } from '../../ui/GLog';
import { Ballistica } from '../mechanics/Ballistica';
import { Hero } from '../hero/Hero';
import { Bag } from './Bag';

export let dropItem: ((item: Item, pos: number) => void) | null = null;

export function setDropItem(fn: (item: Item, pos: number) => void): void {
  dropItem = fn;
}

export class Item {
  static readonly TIME_TO_THROW = 1.0;
  static readonly TIME_TO_PICK_UP = 1.0;
  static readonly TIME_TO_DROP = 1.0;

  static readonly AC_DROP = 'DROP';
  static readonly AC_THROW = 'THROW';

  protected defaultAction: string | null = null;
  usesTargeting = false;

  image = 0;
  icon = -1;
  stackable = false;
  itemQuantity = 1;
  dropsDownHeap = false;

  private _level = 0;
  levelKnown = false;
  cursed = false;
  cursedKnown = false;
  unique = false;
  keptThoughLostInvent = false;
  bones = false;

  actions(_hero?: Hero): string[] {
    return [Item.AC_DROP, Item.AC_THROW];
  }

  execute(hero: Hero, action: string): void {
    if (action === Item.AC_DROP) {
      this.doDrop(hero.pos);
    }
  }

  info(): string {
    let info = this.name();
    if (this.levelKnown && this._level !== 0) {
      info += this._level > 0 ? ` +${this._level}` : ` ${this._level}`;
    }
    if (this.cursedKnown && this.cursed) {
      info += ' (cursed)';
    }
    return info || 'Unknown item';
  }

  doPickUp(): boolean {
    GLog.add(`@@Picked up ${this.name()}`);
    return true;
  }

  doDrop(pos: number): void {
    if (dropItem) dropItem(this, pos);
    GLog.add(`Dropped ${this.name()}`);
  }

  onThrow(cell: number): void {
    if (dropItem) dropItem(this, cell);
    GLog.add(`Threw ${this.name()}`);
  }

  merge(other: Item): Item {
    if (this.isSimilar(other)) {
      this.itemQuantity += other.itemQuantity;
      other.itemQuantity = 0;
    }
    return this;
  }

  collect(container: Bag): boolean {
    if (this.itemQuantity <= 0) return true;
    const items = container.items;
    if (items.includes(this)) return true;

    for (const item of items) {
      if (item instanceof Bag && (item as Bag).canHold(this)) {
        return this.collect(item as Bag);
      }
    }

    if (!container.canHold(this)) return false;

    if (this.stackable) {
      for (const item of items) {
        if (this.isSimilar(item)) {
          item.merge(this);
          return true;
        }
      }
    }

    items.push(this);
    return true;
  }

  split(amount: number): Item | null {
    if (amount <= 0 || amount >= this.itemQuantity) return null;
    const split = new (this.constructor as new () => Item)();
    Object.assign(split, this);
    split.itemQuantity = amount;
    this.itemQuantity -= amount;
    return split;
  }

  duplicate(): Item {
    const dupe = new (this.constructor as new () => Item)();
    Object.assign(dupe, this);
    return dupe;
  }

  detach(container: Bag): Item | null {
    if (this.itemQuantity <= 0) return null;
    if (this.itemQuantity === 1) return this.detachAll(container);
    return this.split(1);
  }

  detachAll(container: Bag): Item {
    const idx = container.items.indexOf(this);
    if (idx !== -1) {
      container.items.splice(idx, 1);
    }
    return this;
  }

  isSimilar(item: Item): boolean {
    return this.constructor === item.constructor;
  }

  trueLevel(): number { return this._level; }
  level(): number { return this._level; }
  setLevel(v: number): void { this._level = v; }

  upgrade(amount = 1): Item {
    this._level += amount;
    return this;
  }

  degrade(amount = 1): Item {
    this._level -= amount;
    return this;
  }

  visiblyUpgraded(): number { return this.levelKnown ? this._level : 0; }
  visiblyCursed(): boolean { return this.cursed && this.cursedKnown; }
  isUpgradable(): boolean { return true; }
  isIdentified(): boolean { return this.levelKnown && this.cursedKnown; }

  identify(): Item {
    this.levelKnown = true;
    this.cursedKnown = true;
    return this;
  }

  name(): string { return this.trueName(); }
  trueName(): string { return this.constructor.name; }

  title(): string {
    let name = this.name();
    if (this.visiblyUpgraded() !== 0) {
      name = `${name} +${this.visiblyUpgraded()}`;
    }
    if (this.itemQuantity > 1) {
      name = `${name} x${this.itemQuantity}`;
    }
    return name;
  }

  quantity(): number { return this.itemQuantity; }
  setQuantity(v: number): Item { this.itemQuantity = v; return this; }

  value(): number { return 0; }
  energyVal(): number { return 0; }

  virtual(): Item {
    const item = new (this.constructor as new () => Item)();
    item.itemQuantity = 0;
    item._level = this._level;
    return item;
  }

  random(): Item { return this; }

  status(): string | null {
    return this.itemQuantity !== 1 ? String(this.itemQuantity) : null;
  }

  throwPos(user: { pos: number }, dst: number): number {
    return new Ballistica(user.pos, dst, Ballistica.PROJECTILE).collisionPos;
  }

  targetingPos(user: { pos: number }, dst: number): number {
    return this.throwPos(user, dst);
  }

  castDelay(): number { return Item.TIME_TO_THROW; }
  pickupDelay(): number { return Item.TIME_TO_PICK_UP; }

  buffedLvl(): number { return this._level; }

  onDetach(): void {
    // override in subclasses
  }

  glowing(): any { return null; }
}
