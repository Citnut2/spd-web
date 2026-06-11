import { Terrain } from '../Terrain';

let onTileChanged: ((pos: number) => void) | null = null;

export function setHighGrassCallbacks(opts: {
  onTileChanged: (pos: number) => void;
}): void {
  onTileChanged = opts.onTileChanged;
}

export class HighGrass {
  static trample(level: { map: number[]; updateFlags: () => void }, pos: number): void {
    if (level.map[pos] === Terrain.GRASS) return;
    level.map[pos] = Terrain.GRASS;
    level.updateFlags();
    if (onTileChanged) onTileChanged(pos);
  }
}
