import type { GameState } from '../schema/GameState';
import type { Diff, TestResult, DiffReport } from '../schema/DiffReport';

function deepDiff(
  path: string,
  java: unknown,
  web: unknown,
  diffs: Diff[]
): void {
  if (java === web) return;
  if (java === null || web === null || typeof java !== 'object' || typeof web !== 'object') {
    diffs.push({ type: 'MISMATCH', path, javaValue: java, webValue: web });
    return;
  }
  const jKeys = new Set([...Object.keys(java as Record<string, unknown>)]);
  const wKeys = new Set([...Object.keys(web as Record<string, unknown>)]);
  for (const k of jKeys) {
    if (!wKeys.has(k)) {
      diffs.push({ type: 'MISSING_IN_WEB', path: `${path}.${k}`, javaValue: (java as Record<string, unknown>)[k], webValue: undefined });
    } else {
      deepDiff(`${path}.${k}`, (java as Record<string, unknown>)[k], (web as Record<string, unknown>)[k], diffs);
    }
  }
  for (const k of wKeys) {
    if (!jKeys.has(k)) {
      diffs.push({ type: 'EXTRA_IN_WEB', path: `${path}.${k}`, javaValue: undefined, webValue: (web as Record<string, unknown>)[k] });
    }
  }
}

export function compareStates(java: GameState, web: GameState): TestResult {
  const diffs: Diff[] = [];
  deepDiff('', java as unknown as Record<string, unknown>, web as unknown as Record<string, unknown>, diffs);

  if (diffs.length > 0) {
    for (const d of diffs) {
      d.javaSource = mapPathToJavaSource(d.path);
      d.tsSource = mapPathToTSSource(d.path);
    }
  }

  return {
    seed: java.seed,
    heroClass: java.hero.class,
    passed: diffs.length === 0,
    checkpoint: java.checkpoint,
    diffs
  };
}

function mapPathToJavaSource(path: string): string | undefined {
  if (path.startsWith('.hero')) return 'Char.java';
  if (path.startsWith('.level.terrain')) return 'SewerLevel.java';
  if (path.startsWith('.level.mobs')) return 'Mob.java';
  if (path.startsWith('.level.heaps')) return 'Heap.java';
  return undefined;
}

function mapPathToTSSource(path: string): string | undefined {
  if (path.startsWith('.hero')) return 'Char.ts';
  if (path.startsWith('.level.terrain')) return 'SewerLevel.ts';
  if (path.startsWith('.level.mobs')) return 'Mob.ts';
  if (path.startsWith('.level.heaps')) return 'Heap.ts';
  return undefined;
}

export function generateReport(results: TestResult[]): DiffReport {
  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}
