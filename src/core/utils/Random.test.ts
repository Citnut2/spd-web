import { describe, it, expect, beforeEach } from 'vitest';
import * as Random from './Random';

describe('Random', () => {
  beforeEach(() => {
    Random.resetGenerators();
  });

  it('produces deterministic sequence from seed', () => {
    Random.pushGenerator('test-seed-42');
    const a = Random.Int(100);
    const b = Random.Int(100);
    Random.popGenerator();

    Random.pushGenerator('test-seed-42');
    expect(Random.Int(100)).toBe(a);
    expect(Random.Int(100)).toBe(b);
    Random.popGenerator();
  });



  it('Float() returns values in [0, 1)', () => {
    Random.pushGenerator('float-test');
    for (let i = 0; i < 100; i++) {
      const v = Random.Float();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    Random.popGenerator();
  });

  it('Float(max) returns values in [0, max)', () => {
    Random.pushGenerator('float-max-test');
    for (let i = 0; i < 100; i++) {
      const v = Random.Float(50);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(50);
    }
    Random.popGenerator();
  });

  it('Float(min, max) returns values in [min, max)', () => {
    Random.pushGenerator('float-range-test');
    for (let i = 0; i < 100; i++) {
      const v = Random.Float(10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
    Random.popGenerator();
  });

  it('Int(max) returns values in [0, max)', () => {
    Random.pushGenerator('int-test');
    for (let i = 0; i < 100; i++) {
      const v = Random.Int(10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
    Random.popGenerator();
  });

  it('Int() without max returns positive 31-bit int', () => {
    Random.pushGenerator('int-default');
    for (let i = 0; i < 100; i++) {
      const v = Random.Int();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(0x7fffffff);
    }
    Random.popGenerator();
  });

  it('Long() returns positive integer from two 32-bit halves', () => {
    Random.pushGenerator('long-test');
    for (let i = 0; i < 100; i++) {
      const v = Random.Long();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(v)).toBe(true);
    }
    Random.popGenerator();
  });

  it('Long() is deterministic', () => {
    Random.pushGenerator('long-det-test');
    const a = Random.Long();
    const b = Random.Long();
    Random.popGenerator();
    Random.pushGenerator('long-det-test');
    expect(Random.Long()).toBe(a);
    expect(Random.Long()).toBe(b);
    Random.popGenerator();
  });

  it('IntRange(min, max) returns values in [min, max]', () => {
    Random.pushGenerator('int-range');
    for (let i = 0; i < 100; i++) {
      const v = Random.IntRange(5, 15);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(15);
    }
    Random.popGenerator();
  });

  it('NormalIntRange returns values centered around midpoint', () => {
    Random.pushGenerator('normal-int');

    const results: number[] = [];
    for (let i = 0; i < 500; i++) {
      results.push(Random.NormalIntRange(0, 10));
    }
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    expect(mean).toBeGreaterThan(3);
    expect(mean).toBeLessThan(7);

    Random.popGenerator();
  });

  it('chances picks an index proportional to weights', () => {
    Random.pushGenerator('chances-test');
    const counts = [0, 0, 0];
    for (let i = 0; i < 5000; i++) {
      const idx = Random.chances([1, 2, 3]);
      if (idx >= 0) counts[idx]!++;
    }
    expect(counts[0]).toBeGreaterThan(0);
    expect(counts[1]).toBeGreaterThan(0);
    expect(counts[2]).toBeGreaterThan(0);
    expect(counts[2]!).toBeGreaterThan(counts[0]!);
    Random.popGenerator();
  });

  it('chances returns -1 for empty/all-zero weights', () => {
    expect(Random.chances([])).toBe(-1);
    expect(Random.chances([0, 0, 0])).toBe(-1);
  });

  it('element picks a random element from an array', () => {
    Random.pushGenerator('element-test');
    const arr = [10, 20, 30, 40];
    for (let i = 0; i < 50; i++) {
      const e = Random.element(arr);
      expect(arr).toContain(e);
    }
    Random.popGenerator();
  });

  it('shuffle reorders array deterministically', () => {
    Random.pushGenerator('shuffle-test');
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const original = [...arr];
    Random.shuffle(arr);
    expect(arr).not.toEqual(original);
    expect(arr.sort((a, b) => a - b)).toEqual(original.sort((a, b) => a - b));
    Random.popGenerator();
  });

  it('shuffle is deterministic for same seed', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [1, 2, 3, 4, 5];

    Random.pushGenerator('shuffle-det');
    Random.shuffle(arr1);
    Random.popGenerator();

    Random.pushGenerator('shuffle-det');
    Random.shuffle(arr2);
    Random.popGenerator();

    expect(arr1).toEqual(arr2);
  });

  it('supports generator stack (push/pop nesting)', () => {
    Random.pushGenerator('outer');
    Random.Int(100);
    Random.pushGenerator('inner');
    const innerVal = Random.Int(100);
    Random.popGenerator();
    const outerVal2 = Random.Int(100);
    Random.popGenerator();

    expect(outerVal2).not.toBe(innerVal);
  });

  it('useGeneratorStack=true uses the stack (current) generator', () => {
    Random.pushGenerator('stack-current');
    const a = Random.Int(100, true);
    const b = Random.Int(100, true);
    Random.popGenerator();

    Random.pushGenerator('stack-current');
    expect(Random.Int(100, true)).toBe(a);
    expect(Random.Int(100, true)).toBe(b);
    Random.popGenerator();
  });

  it('useGeneratorStack=false uses the base generator (ignores stack)', () => {
    Random.pushGenerator('seed-two');
    const stackVal = Random.Int(100000, true);
    // base generator unaffected by stack state
    const baseVal = Random.Int(100000, false);
    Random.popGenerator();

    Random.pushGenerator('seed-two');
    expect(Random.Int(100000, true)).toBe(stackVal);
    Random.popGenerator();

    // base & stack are independent generators
    expect(stackVal).not.toBe(baseVal);
  });

  it('uses base generator when stack is empty after pop', () => {
    Random.resetGenerators();
    Random.pushGenerator('temp');
    Random.popGenerator();
    expect(() => Random.Int(100)).not.toThrow();
  });
});
