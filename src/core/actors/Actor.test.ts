import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Actor } from './Actor';
import { Game } from '../engine/Game';

class TestActor extends Actor {
  act(): boolean {
    return true;
  }
}

describe('Actor', () => {
  let game: Game;

  beforeEach(() => {
    Actor.resetNextID();
    game = new Game();
  });

  afterEach(() => {
    game.clear();
  });

  it('assigns unique IDs', () => {
    const a1 = new TestActor();
    const a2 = new TestActor();
    expect(a1.id).toBe(1);
    expect(a2.id).toBe(2);
  });

  it('resetNextID restarts ID counter', () => {
    new TestActor();
    Actor.resetNextID();
    const a = new TestActor();
    expect(a.id).toBe(1);
  });

  it('spend adds time', () => {
    const a = new TestActor();
    a.spend(2.5);
    expect(a.time).toBe(2.5);
  });

  it('spend accumulates time', () => {
    const a = new TestActor();
    a.spend(1);
    a.spend(2);
    expect(a.time).toBe(3);
  });

  it('isActing is true when time <= Game.now', () => {
    const a = new TestActor();
    a.time = 5;
    game.now = 5;
    expect(a.isActing).toBe(true);
    game.now = 4;
    expect(a.isActing).toBe(false);
  });

  it('nextPos computes 8-directional neighbours', () => {
    // Up
    expect(Actor.nextPos(50, 1, 38)).toBe(12);
    // Down
    expect(Actor.nextPos(50, 6, 38)).toBe(88);
    // Left
    expect(Actor.nextPos(50, 3, 38)).toBe(49);
    // Right
    expect(Actor.nextPos(50, 4, 38)).toBe(51);
  });

  it('nextPos returns same cell for invalid direction', () => {
    expect(Actor.nextPos(50, -1, 38)).toBe(50);
    expect(Actor.nextPos(50, 8, 38)).toBe(50);
  });

  it('has correct priority constants', () => {
    expect(Actor.VFX_PRIO).toBe(100);
    expect(Actor.HERO_PRIO).toBe(0);
    expect(Actor.MOB_PRIO).toBe(-20);
    expect(Actor.BUFF_PRIO).toBe(-30);
  });

  it('has correct time constants', () => {
    expect(Actor.TIME_TO_MOVE).toBe(1.0);
    expect(Actor.TICK).toBe(1.0);
  });
});
