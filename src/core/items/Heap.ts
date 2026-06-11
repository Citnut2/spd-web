import type { Item } from './Item';

export let removeHeap: ((pos: number) => void) | null = null;

export function setRemoveHeap(fn: (pos: number) => void): void {
  removeHeap = fn;
}

export enum HeapType {
  HEAP = 'HEAP',
  FOR_SALE = 'FOR_SALE',
  CHEST = 'CHEST',
  LOCKED_CHEST = 'LOCKED_CHEST',
  CRYSTAL_CHEST = 'CRYSTAL_CHEST',
  TOMB = 'TOMB',
  SKELETON = 'SKELETON',
  REMAINS = 'REMAINS',
}

export class Heap {
  type: HeapType = HeapType.HEAP;
  pos = 0;
  seen = false;
  haunted = false;
  autoExplored = false;
  hidden = false;

  items: Item[] = [];

  pickUp(): Item | null {
    if (this.items.length === 0) {
      this.destroy();
      return null;
    }
    const item = this.items.shift()!;
    if (this.items.length === 0) {
      this.destroy();
    }
    return item;
  }

  peek(): Item | undefined {
    return this.items[0];
  }

  drop(item: Item): void {
    this.hidden = false;
    if (item.stackable && this.type !== HeapType.FOR_SALE) {
      for (const i of this.items) {
        if (i.isSimilar(item)) {
          i.merge(item);
          this.items = this.items.filter(i => i.quantity() > 0);
          return;
        }
      }
    }
    this.items.unshift(item);
  }

  replace(a: Item, b: Item): void {
    this.hidden = false;
    const idx = this.items.indexOf(a);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      for (const i of this.items) {
        if (i.isSimilar(b)) {
          i.merge(b);
          return;
        }
      }
      this.items.splice(idx, 0, b);
    }
  }

  remove(item: Item): void {
    this.hidden = false;
    this.items = this.items.filter(i => i !== item);
    if (this.items.length === 0) {
      this.destroy();
    }
  }

  size(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }

  destroy(): void {
    if (removeHeap) removeHeap(this.pos);
    this.items = [];
  }

  title(): string {
    switch (this.type) {
      case HeapType.FOR_SALE: {
        const i = this.peek();
        if (this.size() === 1) {
          return i ? i.title() : 'For Sale';
        }
        return i ? i.title() : 'Items';
      }
      case HeapType.CHEST: return 'Chest';
      case HeapType.LOCKED_CHEST: return 'Locked Chest';
      case HeapType.CRYSTAL_CHEST: return 'Crystal Chest';
      case HeapType.TOMB: return 'Tomb';
      case HeapType.SKELETON: return 'Skeleton';
      case HeapType.REMAINS: return 'Remains';
      default: return this.peek()?.title() ?? 'Heap';
    }
  }
}
