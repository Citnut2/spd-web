export interface Bundlable {
  storeBundle(): Record<string, unknown>;
  restoreBundle(data: Record<string, unknown>): void;
}

type BundleValue = string | number | boolean | null | Bundlable | BundleValue[] | { [key: string]: unknown };

export class Bundle {
  private data: Map<string, BundleValue> = new Map();

  put(key: string, value: BundleValue): void {
    this.data.set(key, value);
  }

  get(key: string): BundleValue | undefined {
    return this.data.get(key);
  }

  getString(key: string, fallback = ''): string {
    const v = this.data.get(key);
    return typeof v === 'string' ? v : fallback;
  }

  getInt(key: string, fallback = 0): number {
    const v = this.data.get(key);
    return typeof v === 'number' ? Math.floor(v) : fallback;
  }

  getFloat(key: string, fallback = 0): number {
    const v = this.data.get(key);
    return typeof v === 'number' ? v : fallback;
  }

  getBoolean(key: string, fallback = false): boolean {
    const v = this.data.get(key);
    return typeof v === 'boolean' ? v : fallback;
  }

  contains(key: string): boolean {
    return this.data.has(key);
  }

  toJSON(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.data) {
      obj[k] = v;
    }
    return obj;
  }

  static fromJSON(data: Record<string, unknown>): Bundle {
    const b = new Bundle();
    for (const [k, v] of Object.entries(data)) {
      b.put(k, v as BundleValue);
    }
    return b;
  }
}

const classAliases = new Map<string, string>();

export function addAlias(className: string, alias: string): void {
  classAliases.set(alias, className);
}

export function resolveAlias(alias: string): string {
  return classAliases.get(alias) ?? alias;
}
