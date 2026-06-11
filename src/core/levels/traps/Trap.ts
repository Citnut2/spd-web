import { Terrain } from '../Terrain';

let onTileChanged: ((pos: number) => void) | null = null;
let onDisarm: ((pos: number, terrain: number) => void) | null = null;

export function setTrapCallbacks(opts: {
  onTileChanged: (pos: number) => void;
  onDisarm: (pos: number, terrain: number) => void;
}): void {
  onTileChanged = opts.onTileChanged;
  onDisarm = opts.onDisarm;
}

export abstract class Trap {
  pos: number;
  visible = false;
  active = true;
  disarmedByActivation = true;
  canBeHidden = true;

  constructor(pos: number) {
    this.pos = pos;
  }

  reveal(): void {
    this.visible = true;
    if (onTileChanged) onTileChanged(this.pos);
  }

  hide(): void {
    if (this.canBeHidden) {
      this.visible = false;
      if (onTileChanged) onTileChanged(this.pos);
    }
  }

  trigger(): void {
    if (!this.active) return;
    this.disarm();
    this.activate();
  }

  disarm(): void {
    this.active = false;
    if (onDisarm) onDisarm(this.pos, Terrain.INACTIVE_TRAP);
  }

  abstract activate(): void;

  getColor(): number {
    return 0;
  }

  getShape(): number {
    return 0;
  }
}
