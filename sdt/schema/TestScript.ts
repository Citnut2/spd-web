export type Direction = { x: number; y: number };

export type Action =
  | { t: 'wait'; turns: number }
  | { t: 'move'; dir: Direction }
  | { t: 'attack'; dir: Direction }
  | { t: 'moveTo'; pos: number }
  | { t: 'attackTarget'; id: number }
  | { t: 'pickup' }
  | { t: 'useItem'; slot: number }
  | { t: 'equip'; slot: number }
  | { t: 'rest'; turns: number };

export interface Checkpoint {
  label: string;
  when: 'action' | 'turn' | 'end';
  index?: number;
  value?: number;
}

export interface TestScript {
  seed: string;
  heroClass: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'HUNTRESS' | 'DUELIST' | 'CLERIC';
  maxDepth: number;
  maxTurns: number;
  actions: Action[];
  checkpoints: Checkpoint[];
}
