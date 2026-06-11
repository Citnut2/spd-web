// Priority queue for turn-based actor scheduling
// Sort: lower time first, higher priority first when times are equal (within 0.001 tolerance)

import type { Actor } from './Actor';

export class ActorQueue {
  private items: Actor[] = [];

  get size(): number { return this.items.length; }

  add(actor: Actor): void {
    this.items.push(actor);
    this.resort();
  }

  remove(actor: Actor): void {
    const idx = this.items.indexOf(actor);
    if (idx !== -1) {
      this.items.splice(idx, 1);
    }
  }

  peek(): Actor | undefined {
    return this.items[0];
  }

  poll(): Actor | undefined {
    return this.items.shift();
  }

  contains(actor: Actor): boolean {
    return this.items.includes(actor);
  }

  clear(): void {
    this.items = [];
  }

  resort(): void {
    this.items.sort((a, b) => {
      const timeDiff = a.time - b.time;
      if (Math.abs(timeDiff) > 0.001) return timeDiff;
      return b.priority - a.priority; // higher priority first
    });
  }

  findById(id: number): Actor | undefined {
    return this.items.find(a => a.id === id);
  }
}
