export interface Diff {
  type: 'MISMATCH' | 'MISSING_IN_WEB' | 'EXTRA_IN_WEB';
  path: string;
  javaValue: unknown;
  webValue: unknown;
  javaSource?: string;
  tsSource?: string;
}

export interface TestResult {
  seed: string;
  heroClass: string;
  passed: boolean;
  checkpoint: string;
  diffs: Diff[];
}

export interface DiffReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
}
