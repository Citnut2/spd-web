// Port of com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonWallsTilemap

import { Texture } from 'pixi.js';
import { TextureFilm } from './TextureFilm';
import { DungeonTilemap } from './DungeonTilemap';
import { Terrain } from '../levels/Terrain';
import { wallStitcheable, stitchInternalWallTile, stitchWallOverhangTile,
  getVisualWithAlts, NULL_TILE,
  DOOR_SIDEWAYS2, DOOR_SIDEWAYS_LOCKED, DOOR_SIDEWAYS_CRYSTAL,
  DOOR_OVERHANG, DOOR_OVERHANG_OPEN, DOOR_OVERHANG_CRYSTAL,
  EXIT_UNDERHANG, STATUE_OVERHANG, STATUE_SP_OVERHANG,
  REGION_DECO_OVERHANG, REGION_DECO_ALT_OVERHANG,
  ALCHEMY_POT_OVERHANG, BARRICADE_OVERHANG, HIGH_GRASS_OVERHANG,
  FURROWED_OVERHANG, MINE_CRYSTAL_OVERHANG, MINE_BOULDER_OVERHANG,
} from './DungeonTileSheet';

export class DungeonWallsTilemap extends DungeonTilemap {
  static skipCells = new Set<number>();

  constructor(tex: Texture, tileset: TextureFilm) {
    super(tex, tileset);
    DungeonWallsTilemap.skipCells.clear();
  }

  override getTileVisual(pos: number, tile: number, flat: boolean): number {
    if (flat) return -1;

    if (wallStitcheable(tile)) {
      if (pos + this.mapWidth < this.size && !wallStitcheable(this.mapData[pos + this.mapWidth]!)) {
        const below = this.mapData[pos + this.mapWidth]!;
        if (below === Terrain.DOOR)      return DOOR_SIDEWAYS2;
        else if (below === Terrain.LOCKED_DOOR || below === Terrain.HERO_LKD_DR) return DOOR_SIDEWAYS_LOCKED;
        else if (below === Terrain.CRYSTAL_DOOR) return DOOR_SIDEWAYS_CRYSTAL;
        else if (below === Terrain.OPEN_DOOR)    return NULL_TILE;
      } else {
        return stitchInternalWallTile(
          tile,
          (pos + 1) % this.mapWidth !== 0 ?                            this.mapData[pos + 1]! : -1,
          (pos + 1) % this.mapWidth !== 0 && pos + this.mapWidth < this.size ? this.mapData[pos + 1 + this.mapWidth]! : -1,
          pos + this.mapWidth < this.size ?                             this.mapData[pos + this.mapWidth]! : -1,
          pos % this.mapWidth !== 0 && pos + this.mapWidth < this.size ? this.mapData[pos - 1 + this.mapWidth]! : -1,
          pos % this.mapWidth !== 0 ?                                    this.mapData[pos - 1]! : -1,
        );
      }
    }

    if (DungeonWallsTilemap.skipCells.has(pos)) {
      return -1;
    }

    if (tile === Terrain.LOCKED_EXIT || tile === Terrain.UNLOCKED_EXIT) {
      return EXIT_UNDERHANG;
    }

    if (pos + this.mapWidth < this.size && wallStitcheable(this.mapData[pos + this.mapWidth]!)) {
      return stitchWallOverhangTile(
        tile,
        (pos + 1) % this.mapWidth !== 0 ?  this.mapData[pos + 1 + this.mapWidth]! : -1,
        this.mapData[pos + this.mapWidth]!,
        pos % this.mapWidth !== 0 ?         this.mapData[pos - 1 + this.mapWidth]! : -1,
      );
    }

    if (pos + this.mapWidth < this.size) {
      const below = this.mapData[pos + this.mapWidth]!;
      if (below === Terrain.DOOR || below === Terrain.LOCKED_DOOR || below === Terrain.HERO_LKD_DR) {
        return DOOR_OVERHANG;
      } else if (below === Terrain.OPEN_DOOR) {
        return DOOR_OVERHANG_OPEN;
      } else if (below === Terrain.CRYSTAL_DOOR) {
        return DOOR_OVERHANG_CRYSTAL;
      } else if (below === Terrain.STATUE) {
        return STATUE_OVERHANG;
      } else if (below === Terrain.STATUE_SP) {
        return STATUE_SP_OVERHANG;
      } else if (below === Terrain.REGION_DECO) {
        return REGION_DECO_OVERHANG;
      } else if (below === Terrain.REGION_DECO_ALT) {
        return REGION_DECO_ALT_OVERHANG;
      } else if (below === Terrain.MINE_CRYSTAL) {
        return getVisualWithAlts(MINE_CRYSTAL_OVERHANG, pos + this.mapWidth);
      } else if (below === Terrain.MINE_BOULDER) {
        return getVisualWithAlts(MINE_BOULDER_OVERHANG, pos + this.mapWidth);
      } else if (below === Terrain.ALCHEMY) {
        return ALCHEMY_POT_OVERHANG;
      } else if (below === Terrain.BARRICADE) {
        return BARRICADE_OVERHANG;
      } else if (below === Terrain.HIGH_GRASS) {
        return getVisualWithAlts(HIGH_GRASS_OVERHANG, pos + this.mapWidth);
      } else if (below === Terrain.FURROWED_GRASS) {
        return getVisualWithAlts(FURROWED_OVERHANG, pos + this.mapWidth);
      }
    }

    return -1;
  }
}
