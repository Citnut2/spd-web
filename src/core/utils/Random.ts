import seedrandom from 'seedrandom';

const generators: seedrandom.PRNG[] = [];

export function resetGenerators(): void {
  generators.length = 0;
  generators.push(seedrandom());
}

export function pushGenerator(seed?: string | number): void {
  if (seed !== undefined) {
    const scrambled = scrambleSeed(seed);
    generators.push(seedrandom(String(scrambled)));
  } else {
    generators.push(seedrandom());
  }
}

export function popGenerator(): void {
  if (generators.length <= 1) {
    console.warn('tried to pop the last random number generator');
    return;
  }
  generators.pop();
}

function scrambleSeed(seed: string | number): number {
  const MX3 = 0xbea225f9eb34556dn;
  const MASK32 = 0xffffffffn;
  let h = BigInt(typeof seed === 'number' ? seed : hashString(seed));
  h = ((h ^ (h >> 32n)) * MX3) & MASK32;
  h = ((h ^ (h >> 29n)) * MX3) & MASK32;
  h = ((h ^ (h >> 32n)) * MX3) & MASK32;
  h = (h ^ (h >> 29n)) & MASK32;
  return Number(h);
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function current(): seedrandom.PRNG {
  return generators[generators.length - 1] ?? generators[0]!;
}

function base(): seedrandom.PRNG {
  return generators[0]!;
}

export function Float(): number;
export function Float(useGeneratorStack: boolean): number;
export function Float(max: number): number;
export function Float(min: number, max: number): number;
export function Float(a?: number | boolean, b?: number): number {
  const gen = typeof a === 'boolean' ? (a ? current() : base()) : current();
  const val = gen();
  if (typeof a === 'number' && b === undefined) return val * a;
  if (typeof a === 'number' && b !== undefined) return a + val * (b - a);
  return val;
}

export function Int(): number;
export function Int(max: number): number;
export function Int(max: number, useGeneratorStack: boolean): number;
export function Int(a?: number | boolean, b?: boolean): number {
  const gen = typeof b === 'boolean' ? (b ? current() : base()) : current();
  const max = typeof a === 'number' ? a : 0x7fffffff;
  return Math.floor(gen() * max);
}

export function Long(): number;
export function Long(useGeneratorStack: boolean): number;
export function Long(a?: boolean): number {
  const gen = typeof a === 'boolean' ? (a ? current() : base()) : current();
  // Generate a full 53-bit integer by combining two 32-bit halves from the RNG.
  // This loses the full 64-bit range but preserves determinism and provides
  // sufficient precision for seed derivation.
  const hi = Math.floor(gen() * 0x100000000);
  const lo = Math.floor(gen() * 0x100000000);
  return hi * 0x100000000 + lo;
}

export function IntRange(min: number, max: number): number {
  return min + Math.floor(Float() * (max - min + 1));
}

export function NormalIntRange(min: number, max: number): number {
  return min + Math.floor((Float() + Float()) * (max - min + 1) / 2);
}

export function InvNormalIntRange(min: number, max: number): number {
  const roll1 = Float();
  const roll2 = Float();
  if (Math.abs(roll1 - 0.5) >= Math.abs(roll2 - 0.5)) {
    return min + Math.floor(roll1 * (max - min + 1));
  }
  return min + Math.floor(roll2 * (max - min + 1));
}

export function chances(weights: number[]): number {
  let sum = 0;
  for (const w of weights) sum += Math.max(0, w);
  if (sum <= 0) return -1;
  const value = Float(sum);
  let running = 0;
  for (let i = 0; i < weights.length; i++) {
    running += Math.max(0, weights[i]!);
    if (value < running) return i;
  }
  return -1;
}

export function element<T>(arr: T[]): T {
  const idx = Math.floor(Float() * arr.length);
  return arr[idx] as T;
}

export function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Float() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

resetGenerators();
