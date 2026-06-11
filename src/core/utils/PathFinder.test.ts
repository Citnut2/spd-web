import { describe, it, expect, beforeEach } from 'vitest';
import { PathFinder } from './PathFinder';

describe('PathFinder', () => {
  beforeEach(() => {
    PathFinder.setMapSize(10, 10);
  });



  it('setMapSize initialises neighbour arrays', () => {
    expect(PathFinder.width).toBe(10);
    expect(PathFinder.height).toBe(10);
    expect(PathFinder.size).toBe(100);
    expect(PathFinder.NEIGHBOURS4).toEqual([-10, -1, 1, 10]);
    expect(PathFinder.NEIGHBOURS8).toHaveLength(8);
    expect(PathFinder.NEIGHBOURS9).toHaveLength(9);
  });

  it('finds direct path on open terrain', () => {
    const passable = new Array(100).fill(true);
    const path = PathFinder.find(0, 9, passable);
    expect(path).not.toBeNull();
    expect(path![path!.length - 1]).toBe(9);
  });

  it('returns null when destination is unreachable', () => {
    const passable = new Array(100).fill(false);
    passable[0] = true;
    const path = PathFinder.find(0, 9, passable);
    expect(path).toBeNull();
  });

  it('finds path around obstacles', () => {
    const passable = new Array(100).fill(true);
    for (let i = 1; i <= 8; i++) {
      passable[i] = false;
    }
    const path = PathFinder.find(0, 9, passable);
    expect(path).not.toBeNull();
    expect(path![path!.length - 1]).toBe(9);
  });

  it('returns null when from is out of bounds', () => {
    const passable = new Array(100).fill(true);
    expect(PathFinder.find(-1, 9, passable)).toBeNull();
    expect(PathFinder.find(200, 9, passable)).toBeNull();
  });

  it('returns null when to is out of bounds', () => {
    const passable = new Array(100).fill(true);
    expect(PathFinder.find(0, -1, passable)).toBeNull();
    expect(PathFinder.find(0, 200, passable)).toBeNull();
  });

  it('path starts from source position (end of result array)', () => {
    const passable = new Array(100).fill(true);
    PathFinder.setMapSize(5, 5);
    const path = PathFinder.find(0, 24, passable);
    expect(path).not.toBeNull();
    expect(path![0]).not.toBe(0);
  });

  it('returns path with no duplicate steps', () => {
    const passable = new Array(100).fill(true);
    const path = PathFinder.find(0, 99, passable);
    expect(path).not.toBeNull();
    const seen = new Set<number>();
    for (const step of path!) {
      expect(seen.has(step)).toBe(false);
      seen.add(step);
    }
  });

  it('finds path in narrow corridor', () => {
    const passable = new Array(100).fill(false);
    for (let y = 0; y < 10; y++) {
      passable[y * 10 + 5] = true;
    }
    PathFinder.setMapSize(10, 10);
    const path = PathFinder.find(5, 95, passable);
    expect(path).not.toBeNull();
    expect(path![path!.length - 1]).toBe(95);
  });

  it('NEIGHBOURS4_OFFSETS has correct values', () => {
    expect(PathFinder.NEIGHBOURS4_OFFSETS).toEqual([
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]);
  });

  it('NEIGHBOURS8_OFFSETS has correct values', () => {
    expect(PathFinder.NEIGHBOURS8_OFFSETS).toHaveLength(8);
    expect(PathFinder.NEIGHBOURS8_OFFSETS[0]).toEqual({ x: -1, y: -1 });
    expect(PathFinder.NEIGHBOURS8_OFFSETS[4]).toEqual({ x: 1, y: 0 });
  });
});
