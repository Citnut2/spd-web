import { describe, it, expect, beforeEach } from 'vitest';
import { ActorQueue } from './ActorQueue';
import { Actor } from './Actor';

class TestActor extends Actor {
  acted = false;
  act(): boolean {
    this.acted = true;
    return true;
  }
}

describe('ActorQueue', () => {
  let queue: ActorQueue;

  beforeEach(() => {
    Actor.resetNextID();
    queue = new ActorQueue();
  });

  it('starts empty', () => {
    expect(queue.size).toBe(0);
    expect(queue.peek()).toBeUndefined();
  });

  it('add inserts actor', () => {
    const a = new TestActor();
    queue.add(a);
    expect(queue.size).toBe(1);
    expect(queue.contains(a)).toBe(true);
  });

  it('poll returns and removes first actor', () => {
    const a = new TestActor();
    queue.add(a);
    const p = queue.poll();
    expect(p).toBe(a);
    expect(queue.size).toBe(0);
  });

  it('peek returns without removing', () => {
    const a = new TestActor();
    queue.add(a);
    expect(queue.peek()).toBe(a);
    expect(queue.size).toBe(1);
  });

  it('remove removes an actor', () => {
    const a = new TestActor();
    queue.add(a);
    queue.remove(a);
    expect(queue.size).toBe(0);
    expect(queue.contains(a)).toBe(false);
  });

  it('orders by time ascending', () => {
    const a1 = new TestActor(); a1.time = 3;
    const a2 = new TestActor(); a2.time = 1;
    const a3 = new TestActor(); a3.time = 2;
    queue.add(a1);
    queue.add(a2);
    queue.add(a3);

    expect(queue.poll()).toBe(a2);
    expect(queue.poll()).toBe(a3);
    expect(queue.poll()).toBe(a1);
  });

  it('orders by priority descending when times are equal', () => {
    const a1 = new TestActor(); a1.time = 1; a1.priority = Actor.VFX_PRIO;
    const a2 = new TestActor(); a2.time = 1; a2.priority = Actor.HERO_PRIO;
    const a3 = new TestActor(); a3.time = 1; a3.priority = Actor.MOB_PRIO;
    queue.add(a3);
    queue.add(a1);
    queue.add(a2);

    expect(queue.poll()).toBe(a1);  // VFX_PRIO (100) first
    expect(queue.poll()).toBe(a2);  // HERO_PRIO (0)
    expect(queue.poll()).toBe(a3);  // MOB_PRIO (-20)
  });

  it('findById returns actor by ID', () => {
    const a = new TestActor();
    queue.add(a);
    expect(queue.findById(a.id)).toBe(a);
    expect(queue.findById(999)).toBeUndefined();
  });

  it('clear removes all actors', () => {
    queue.add(new TestActor());
    queue.add(new TestActor());
    queue.clear();
    expect(queue.size).toBe(0);
  });

  it('resort re-orders after time changes', () => {
    const a1 = new TestActor(); a1.time = 10;
    const a2 = new TestActor(); a2.time = 5;
    queue.add(a1);
    queue.add(a2);

    expect(queue.poll()).toBe(a2);

    // Re-add a1 and change time
    a1.time = 1;
    queue.add(a1);
    expect(queue.poll()).toBe(a1);
  });
});
