// Port of com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTerrainTilemap

import { Texture } from 'pixi.js';
import { TextureFilm } from './TextureFilm';
import { DungeonTilemap } from './DungeonTilemap';
import { Terrain } from '../levels/Terrain';
import { directVisuals, getVisualWithAlts, stitchWaterTile,
  stitchChasmTile, doorTile, wallStitcheable, getRaisedDoorTile,
  getRaisedWallTile, NULL_TILE, RAISED_STATUE, RAISED_STATUE_SP,
  RAISED_REGION_DECO, RAISED_REGION_DECO_ALT, RAISED_ALCHEMY_POT,
  RAISED_BARRICADE, RAISED_HIGH_GRASS, RAISED_FURROWED_GRASS,
  RAISED_MINE_CRYSTAL, RAISED_MINE_BOULDER, directFlatVisuals,
} from './DungeonTileSheet';

export class DungeonTerrainTilemap extends DungeonTilemap {
  static instance: DungeonTerrainTilemap | null = null;

  constructor(tex: Texture, tileset: TextureFilm) {
    super(tex, tileset);
    DungeonTerrainTilemap.instance = this;
  }

  override getTileVisual(pos: number, tile: number, flat: boolean): number {
    const visual = directVisuals.get(tile, -1);
    if (visual !== -1) return getVisualWithAlts(visual, pos);

    if (tile === Terrain.WATER) {
      const w = this.mapWidth;
      return stitchWaterTile(
        this.mapData[pos - w]!,
        this.mapData[pos + 1]!,
        this.mapData[pos + w]!,
        this.mapData[pos - 1]!,
      );
    } else if (tile === Terrain.CHASM) {
      return stitchChasmTile(
        pos > this.mapWidth ? this.mapData[pos - this.mapWidth] : undefined
      );
    }

    if (!flat) {
      if (doorTile(tile)) {
        return getRaisedDoorTile(tile, this.mapData[pos - this.mapWidth]!);
      } else if (wallStitcheable(tile)) {
        return getRaisedWallTile(
          tile, pos,
          (pos + 1) % this.mapWidth !== 0 ? this.mapData[pos + 1]! : -1,
          pos + this.mapWidth < this.size ? this.mapData[pos + this.mapWidth]! : -1,
          pos % this.mapWidth !== 0 ? this.mapData[pos - 1]! : -1,
        );
      } else if (tile === Terrain.STATUE) {
        return RAISED_STATUE;
      } else if (tile === Terrain.STATUE_SP) {
        return RAISED_STATUE_SP;
      } else if (tile === Terrain.REGION_DECO) {
        return RAISED_REGION_DECO;
      } else if (tile === Terrain.REGION_DECO_ALT) {
        return RAISED_REGION_DECO_ALT;
      } else if (tile === Terrain.MINE_CRYSTAL) {
        return getVisualWithAlts(RAISED_MINE_CRYSTAL, pos);
      } else if (tile === Terrain.MINE_BOULDER) {
        return getVisualWithAlts(RAISED_MINE_BOULDER, pos);
      } else if (tile === Terrain.ALCHEMY) {
        return RAISED_ALCHEMY_POT;
      } else if (tile === Terrain.BARRICADE) {
        return RAISED_BARRICADE;
      } else if (tile === Terrain.HIGH_GRASS) {
        return getVisualWithAlts(RAISED_HIGH_GRASS, pos);
      } else if (tile === Terrain.FURROWED_GRASS) {
        return getVisualWithAlts(RAISED_FURROWED_GRASS, pos);
      } else {
        return NULL_TILE;
      }
    } else {
      return getVisualWithAlts(directFlatVisuals.get(tile, NULL_TILE), pos);
    }
  }

  override needsRender(pos: number): boolean {
    return super.needsRender(pos) && this.data[pos] !== 140; // WATER base index
  }

  static resetInstance(): void {
    DungeonTerrainTilemap.instance = null;
  }
}
