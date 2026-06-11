// === Protocol types ===

export interface Command {
  id: number;
  cmd: string;
  params?: Record<string, unknown>;
}

export interface Response {
  id: number;
  ok: boolean;
  type?: 'state' | 'ack' | 'exit';
  data?: GameScreenState;
  error?: string;
}

// === Scene graph types ===

export interface CameraInfo {
  type: string;
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  screenWidth: number;
  screenHeight: number;
}

export interface SceneElement {
  id: string;
  type: 'Image' | 'BitmapText' | 'Group' | 'Visual';
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  visible: boolean;
  camera: string;
  tint?: {
    rm: number; gm: number; bm: number; am: number;
    ra: number; ga: number; ba: number; aa: number;
  };
  texture?: string;
  frame?: { x: number; y: number; width: number; height: number };
  text?: string;
  font?: string;
  children?: number;
}

export interface SceneState {
  type: string;
  camera: CameraInfo;
  cameras: CameraInfo[];
  elements: SceneElement[];
}

// === Game state types (matches ParityOracle) ===

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
  alignment: string;
  state: string;
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

export interface GameScreenState {
  game: GameState;
  scene: SceneState;
}

// === CLI options ===

export interface AgentOptions {
  javaCmd?: string;
  jarPath?: string;
  cwd?: string;
}

export interface ScriptAction {
  cmd: string;
  params?: Record<string, unknown>;
  label?: string;
}
