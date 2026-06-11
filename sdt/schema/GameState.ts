export interface ItemState {
  type: string;
  quantity: number;
  level?: number;
  cursed?: boolean;
  identified?: boolean;
}

export interface HeroState {
  pos: number;
  HP: number;
  HT: number;
  STR: number;
  class: string;
  level: number;
  XP: number;
  weapon: ItemState | null;
  armor: ItemState | null;
  ring: ItemState | null;
  artifact: ItemState | null;
  inventory: ItemState[];
}

export interface MobState {
  id: number;
  type: string;
  pos: number;
  HP: number;
  HT: number;
  alignment: 'ENEMY' | 'NEUTRAL' | 'ALLY';
  state: 'SLEEPING' | 'WANDERING' | 'HUNTING' | 'FLEEING' | 'PASSIVE';
}

export interface HeapState {
  pos: number;
  items: ItemState[];
}

export interface LevelState {
  width: number;
  height: number;
  terrain: number[];
  mobs: MobState[];
  heaps: HeapState[];
  entrance: number;
  exit: number;
}

export interface GameState {
  seed: string;
  depth: number;
  turn: number;
  hero: HeroState;
  level: LevelState;
  rngCalls: number;
  checkpoint: string;
}
