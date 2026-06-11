// Port of com.watabou.utils.SparseArray (extends IntMap)
export class SparseArray<T> {
  private _map = new Map<number, T>();

  put(key: number, value: T): T | undefined {
    const prev = this._map.get(key);
    this._map.set(key, value);
    return prev;
  }

  get(key: number, defaultValue: T): T;
  get(key: number, defaultValue?: T): T | undefined {
    if (this._map.has(key)) return this._map.get(key);
    return defaultValue;
  }

  remove(key: number): T | undefined {
    const prev = this._map.get(key);
    this._map.delete(key);
    return prev;
  }

  containsKey(key: number): boolean {
    return this._map.has(key);
  }

  keyArray(): number[] {
    return Array.from(this._map.keys());
  }

  values(): T[] {
    return Array.from(this._map.values());
  }

  get size(): number {
    return this._map.size;
  }

  clear(): void {
    this._map.clear();
  }

  get map(): Map<number, T> {
    return this._map;
  }
}
