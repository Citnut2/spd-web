// Port of com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings

import type { Hero } from './Hero';
import { Bag } from '../items/Bag';
import type { Item } from '../items/Item';

export class Backpack extends Bag {
  capacity = 20;

  capacityOverride(): number {
    let cap = this.capacity;
    for (const item of this.items) {
      if (item instanceof Bag) cap++;
    }
    return cap;
  }
}

export class Belongings {
  owner: Hero;

  backpack: Backpack;

  weapon: any = null;
  armor: any = null;
  artifact: any = null;
  misc: any = null;
  ring: any = null;

  thrownWeapon: any = null;
  abilityWeapon: any = null;
  secondWep: any = null;

  private lostInvent = false;

  constructor(owner: Hero) {
    this.owner = owner;
    this.backpack = new Backpack();
  }

  attackingWeapon(): any {
    if (this.thrownWeapon) return this.thrownWeapon;
    if (this.abilityWeapon) return this.abilityWeapon;
    return this.weapon;
  }

  lostInventory(val?: boolean): boolean {
    if (val !== undefined) this.lostInvent = val;
    return this.lostInvent;
  }

  weaponEquipped(): any {
    if (!this.lostInvent || (this.weapon && this.weapon.keptThoughLostInvent)) {
      return this.weapon;
    }
    return null;
  }

  armorEquipped(): any {
    if (!this.lostInvent || (this.armor && this.armor.keptThoughLostInvent)) {
      return this.armor;
    }
    return null;
  }

  artifactEquipped(): any {
    if (!this.lostInvent || (this.artifact && this.artifact.keptThoughLostInvent)) {
      return this.artifact;
    }
    return null;
  }

  miscEquipped(): any {
    if (!this.lostInvent || (this.misc && this.misc.keptThoughLostInvent)) {
      return this.misc;
    }
    return null;
  }

  ringEquipped(): any {
    if (!this.lostInvent || (this.ring && this.ring.keptThoughLostInvent)) {
      return this.ring;
    }
    return null;
  }

  secondWepEquipped(): any {
    if (!this.lostInvent || (this.secondWep && this.secondWep.keptThoughLostInvent)) {
      return this.secondWep;
    }
    return null;
  }

  clear(): void {
    this.backpack.clear();
    this.weapon = null;
    this.secondWep = null;
    this.armor = null;
    this.artifact = null;
    this.misc = null;
    this.ring = null;
  }

  getBags(): Bag[] {
    const result: Bag[] = [this.backpack];
    for (const item of this) {
      if (item instanceof Bag) {
        result.push(item);
      }
    }
    return result;
  }

  getItem<T extends Item>(itemClass: new (...args: any[]) => T): T | undefined {
    const lost = this.lostInvent;
    for (const item of this) {
      if (item instanceof itemClass) {
        if (!lost || item.keptThoughLostInvent) {
          return item;
        }
      }
    }
    return undefined;
  }

  getAllItems<T extends Item>(itemClass: new (...args: any[]) => T): T[] {
    const result: T[] = [];
    const lost = this.lostInvent;
    for (const item of this) {
      if (item instanceof itemClass) {
        if (!lost || item.keptThoughLostInvent) {
          result.push(item);
        }
      }
    }
    return result;
  }

  contains(item: Item): boolean {
    const lost = this.lostInvent;
    for (const i of this) {
      if (i === item) {
        if (!lost || i.keptThoughLostInvent) {
          return true;
        }
      }
    }
    return false;
  }

  getSimilar(similar: Item): Item | undefined {
    const lost = this.lostInvent;
    for (const item of this) {
      if (item !== similar && similar.isSimilar(item)) {
        if (!lost || item.keptThoughLostInvent) {
          return item;
        }
      }
    }
    return undefined;
  }

  getAllSimilar(similar: Item): Item[] {
    const result: Item[] = [];
    const lost = this.lostInvent;
    for (const item of this) {
      if (item !== similar && similar.isSimilar(item)) {
        if (!lost || item.keptThoughLostInvent) {
          result.push(item);
        }
      }
    }
    return result;
  }

  identify(): void {
    for (const item of this) {
      item.identify();
    }
  }

  *[Symbol.iterator](): Iterator<Item> {
    const equipped = [this.weapon, this.armor, this.artifact, this.misc, this.ring, this.secondWep];
    for (const item of equipped) {
      if (item) yield item;
    }
    for (const item of this.backpack) {
      yield item;
    }
  }
}
