import { describe, it, expect } from 'vitest';
import { WebStateDumper } from './WebStateDumper';
import type { TestScript, GameState } from '../schema';
import { compareStates } from '../diff-engine/DiffEngine';

const testScripts: TestScript[] = [
  {
    seed: 'TEST-ABC',
    heroClass: 'WARRIOR',
    maxDepth: 1,
    maxTurns: 20,
    actions: [
      { t: 'wait', turns: 2 },
      { t: 'move', dir: { x: 0, y: -1 } },
      { t: 'move', dir: { x: -1, y: 0 } },
    ],
    checkpoints: [
      { label: 'init', when: 'action', index: 0 },
      { label: 'action_1', when: 'action', index: 1 },
      { label: 'action_2', when: 'action', index: 2 },
      { label: 'action_3', when: 'action', index: 3 },
      { label: 'final', when: 'end' }
    ]
  },
  {
    seed: 'RAT-SLAYER',
    heroClass: 'WARRIOR',
    maxDepth: 1,
    maxTurns: 30,
    actions: [
      { t: 'wait', turns: 3 },
      { t: 'move', dir: { x: 1, y: 0 } },
      { t: 'wait', turns: 5 },
    ],
    checkpoints: [
      { label: 'init', when: 'action', index: 0 },
      { label: 'turn_5', when: 'turn', value: 5 },
      { label: 'final', when: 'end' }
    ]
  }
];

describe('SDT Web Harness', () => {
  for (const script of testScripts) {
    it(`generates deterministic state for seed "${script.seed}"`, async () => {
      const dumper1 = new WebStateDumper(script);
      const states1 = await dumper1.run();

      const dumper2 = new WebStateDumper(script);
      const states2 = await dumper2.run();

      expect(states1.length).toBe(states2.length);
      for (let i = 0; i < states1.length; i++) {
        const s1 = states1[i];
        const s2 = states2[i];
        if (s1 && s2) {
          const result = compareStates(s1, s2);
          expect(result.passed).toBe(true);
        }
      }
    });
  }
});

describe('SDT Java vs Web Parity', () => {
  for (const script of testScripts) {
    it(`matches Java output for "${script.seed}"`, async () => {
      const dumper = new WebStateDumper(script);
      const webStates = await dumper.run();

      // Java dump at sdt/sync-tracker/java-dump-<SEED>.json (written by run-parity.sh)
      // or override via env var JAVA_DUMP_<SEED>
      const envKey = `JAVA_DUMP_${script.seed}`;
      let javaDumpPath = process.env[envKey];
      if (!javaDumpPath) {
        const fallback = new URL(`../../sdt/sync-tracker/java-dump-${script.seed}.json`, import.meta.url);
        javaDumpPath = fallback.pathname;
      }
      if (javaDumpPath) {
        const fs = await import('node:fs');
        if (fs.existsSync(javaDumpPath)) {
          const raw = fs.readFileSync(javaDumpPath, 'utf-8');
          const javaStates: GameState[] = JSON.parse(raw);

          expect(webStates.length).toBe(javaStates.length);
          for (let i = 0; i < webStates.length; i++) {
            const ws = webStates[i];
            const js = javaStates[i];
            if (ws && js) {
              const result = compareStates(js, ws);
              expect(result.passed).toBe(true);
            }
          }
        } else {
          console.log(`Skipping Java comparison for ${script.seed} — no dump at ${javaDumpPath}`);
        }
      } else {
        console.log(`Skipping Java comparison for ${script.seed}`);
      }
    });
  }
});
