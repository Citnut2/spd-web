import { Item } from './Item';

export class Bag extends Item {
  items: Item[] = [];
  capacity = 20;

  canHold(item: Item): boolean {
    return this.items.length < this.capacity && item !== this;
  }

  contains(item: Item): boolean {
    return this.items.includes(item);
  }

  clear(): void {
    this.items = [];
  }

  grabItems(): void {
    // no-op for now
  }

  *[Symbol.iterator](): Iterator<Item> {
    for (const item of this.items) {
      yield item;
    }
  }
}
