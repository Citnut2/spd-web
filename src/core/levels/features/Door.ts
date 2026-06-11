import { Terrain } from '../Terrain';

let onTileChanged: ((pos: number) => void) | null = null;
let onObserve: (() => void) | null = null;
let getHeroPos: (() => number | null) | null = null;

export function setDoorCallbacks(opts: {
  onTileChanged: (pos: number) => void;
  onObserve: () => void;
  getHeroPos: () => number | null;
}): void {
  onTileChanged = opts.onTileChanged;
  onObserve = opts.onObserve;
  getHeroPos = opts.getHeroPos;
}

export class Door {
  static enter(pos: number, level: { map: number[]; updateFlags: () => void; heroFOV: boolean[] }): void {
    if (level.map[pos] !== Terrain.DOOR) return;
    level.map[pos] = Terrain.OPEN_DOOR;
    level.updateFlags();
    if (onTileChanged) onTileChanged(pos);
    if (level.heroFOV[pos]) {
      if (onObserve) onObserve();
    }
  }

  static leave(pos: number, level: { map: number[]; updateFlags: () => void; heroFOV: boolean[]; heaps: Map<number, unknown>; mobs: any[] }): void {
    if (level.map[pos] !== Terrain.OPEN_DOOR) return;

    let chars = 0;
    for (const m of level.mobs) {
      if (m.pos === pos) chars++;
    }
    const heroPos = getHeroPos ? getHeroPos() : null;
    if (heroPos !== null && heroPos === pos) chars++;

    if (!level.heaps.has(pos) && chars <= 1) {
      level.map[pos] = Terrain.DOOR;
      level.updateFlags();
      if (onTileChanged) onTileChanged(pos);
      if (level.heroFOV[pos]) {
        if (onObserve) onObserve();
      }
    }
  }
}
