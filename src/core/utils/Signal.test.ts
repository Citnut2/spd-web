import { describe, it, expect } from 'vitest';
import { Signal } from './Signal';

describe('Signal', () => {
  it('dispatches value to a listener', () => {
    const s = new Signal<number>();
    let received = 0;
    s.add((v) => { received = v; });
    s.dispatch(42);
    expect(received).toBe(42);
  });

  it('dispatches to multiple listeners', () => {
    const s = new Signal<string>();
    const results: string[] = [];
    s.add((v) => { results.push(`a:${v}`); });
    s.add((v) => { results.push(`b:${v}`); });
    s.dispatch('hello');
    expect(results).toEqual(['a:hello', 'b:hello']);
  });

  it('does not dispatch to removed listener', () => {
    const s = new Signal<number>();
    let count = 0;
    const fn = () => { count++; };
    s.add(fn);
    s.dispatch(1);
    s.remove(fn);
    s.dispatch(2);
    expect(count).toBe(1);
  });

  it('removeAll clears all listeners', () => {
    const s = new Signal<number>();
    let count = 0;
    s.add(() => { count++; });
    s.add(() => { count++; });
    s.removeAll();
    s.dispatch(1);
    expect(count).toBe(0);
  });

  it('does not add duplicate listener', () => {
    const s = new Signal<number>();
    let count = 0;
    const fn = () => { count++; };
    s.add(fn);
    s.add(fn);
    s.dispatch(1);
    expect(count).toBe(1);
  });
});
