// Port of com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap

import { Texture } from 'pixi.js';
import { TextureFilm } from './TextureFilm';
import { Tilemap } from './Tilemap';
import { pointF, PointF } from '../utils/Geom';

export abstract class DungeonTilemap extends Tilemap {
  static readonly SIZE = 16;

  constructor(tex: Texture, tileset: TextureFilm) {
    super(tex, tileset);
  }

  abstract override getTileVisual(pos: number, tile: number, flat: boolean): number;

  /** Convert a cell position to world pixel coords (top-left of tile) */
  static tileToWorld(pos: number, mapWidth: number): PointF {
    return pointF(
      (pos % mapWidth) * DungeonTilemap.SIZE,
      Math.floor(pos / mapWidth) * DungeonTilemap.SIZE,
    );
  }

  /** Convert a cell position to world pixel coords (center of tile) */
  static tileCenterToWorld(pos: number, mapWidth: number): PointF {
    return pointF(
      ((pos % mapWidth) + 0.5) * DungeonTilemap.SIZE,
      (Math.floor(pos / mapWidth) + 0.5) * DungeonTilemap.SIZE,
    );
  }

  static raisedTileCenterToWorld(pos: number, mapWidth: number): PointF {
    return pointF(
      ((pos % mapWidth) + 0.5) * DungeonTilemap.SIZE,
      (Math.floor(pos / mapWidth) + 0.1) * DungeonTilemap.SIZE,
    );
  }

  static worldToTile(worldX: number, worldY: number, mapWidth: number): number {
    return Math.floor(worldX / DungeonTilemap.SIZE)
      + Math.floor(worldY / DungeonTilemap.SIZE) * mapWidth;
  }
}
