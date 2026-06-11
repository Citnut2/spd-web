// Orchestrates all tilemap layers matching Java GameScene layer order
// Layer order (back to front):
//   1. water (SkinnedBlock) — animated water surface
//   2. terrain tiles (DungeonTerrainTilemap)
//   3. terrain features (plants, traps, high grass)
//   4. wall tiles (DungeonWallsTilemap)
//   5. fog of war (FogOfWar)
//   6. grid (optional)

import { Assets, Container, Texture } from 'pixi.js';
import { TextureFilm } from './TextureFilm';
import { DungeonTerrainTilemap } from './DungeonTerrainTilemap';
import { DungeonWallsTilemap } from './DungeonWallsTilemap';
import { WaterRenderer } from './WaterRenderer';
import { setupVariance } from './DungeonTileSheet';
import { Level } from '../levels/Level';
import { Camera } from '../engine/Camera';
import { Dungeon } from '../levels/Dungeon';

const TILE_SIZE = 16;

export class DungeonRenderer {
  readonly container: Container;
  readonly sprites: Container;

  private terrainLayer: DungeonTerrainTilemap | null = null;
  private wallsLayer: DungeonWallsTilemap | null = null;
  private waterLayer: WaterRenderer | null = null;

  private texture: Texture | null = null;
  private tileset: TextureFilm | null = null;

  private camera: Camera;

  constructor(camera: Camera) {
    this.container = new Container();
    this.sprites = new Container();
    this.camera = camera;
  }

  async loadTileSheet(assetPath: string): Promise<void> {
    const tex = await Assets.load(assetPath);
    this.texture = tex;
    this.tileset = new TextureFilm(
      tex.width,
      tex.height,
      TILE_SIZE,
      TILE_SIZE,
    );
  }

  setLevel(level: Level): void {
    if (!this.texture || !this.tileset) return;

    // Match Java: DungeonTileSheet.setupVariance(map.length, Dungeon.seedCurDepth())
    setupVariance(level.length, Dungeon.seedCurDepth());

    this.container.removeChildren();
    this.terrainLayer = null;
    this.wallsLayer = null;
    this.waterLayer = null;
    this.sprites.removeChildren();

    const mapPixelW = level.width * TILE_SIZE;
    const mapPixelH = level.height * TILE_SIZE;

    // Layer 0: water (animated tiling sprite) — bottommost
    const waterTexPath = level.waterTex();
    if (waterTexPath) {
      const waterTex = Assets.get(waterTexPath);
      if (waterTex) {
        this.waterLayer = new WaterRenderer(waterTex, mapPixelW, mapPixelH);
        this.container.addChild(this.waterLayer);
      }
    }

    // Layer 1: terrain tiles (floor, walls, doors, grass, water)
    this.terrainLayer = new DungeonTerrainTilemap(this.texture, this.tileset);
    this.terrainLayer.map(level.map, level.width);
    this.container.addChild(this.terrainLayer);

    // Layer 2: wall tiles (internal walls, overhangs, door side-views)
    this.wallsLayer = new DungeonWallsTilemap(this.texture, this.tileset);
    this.wallsLayer.map(level.map, level.width);
    this.container.addChild(this.wallsLayer);

    // Layer 3: sprites container (hero + mobs) — added by GameScene
    this.container.addChild(this.sprites);

    // Update camera bounds and center on entrance
    this.camera.setBounds(level.width, level.height);
    const entranceX = (level.entrance % level.width) * TILE_SIZE + TILE_SIZE / 2;
    const entranceY = Math.floor(level.entrance / level.width) * TILE_SIZE + TILE_SIZE / 2;
    this.camera.centerOn(entranceX, entranceY);
  }

  updateLevel(level: Level): void {
    if (!this.terrainLayer || !this.wallsLayer) {
      this.setLevel(level);
      return;
    }
    this.terrainLayer.map(level.map, level.width);
    this.wallsLayer.map(level.map, level.width);
  }

  updateCell(pos: number): void {
    this.terrainLayer?.updateMapCell(pos);
    this.wallsLayer?.updateMapCell(pos);
  }

  update(dt: number): void {
    if (this.waterLayer) {
      this.waterLayer.update(dt);
    }
  }

  destroy(): void {
    this.container.removeChildren();
    this.terrainLayer = null;
    this.wallsLayer = null;
    this.waterLayer = null;
  }
}
