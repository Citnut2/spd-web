// Port of com.watabou.noosa.Tilemap
// Uses PixiJS Sprites for tile rendering (auto-batched by renderer)

import { Container, Sprite, Texture } from 'pixi.js';
import { TextureFilm } from './TextureFilm';

export abstract class Tilemap extends Container {
  protected texture: Texture;
  protected tileset: TextureFilm;

  // Original terrain map (from Level)
  protected mapData: number[] = [];
  // Computed visual frame indices
  protected data: number[] = [];

  protected mapWidth = 0;
  protected mapHeight = 0;
  protected size = 0;

  private sprites: Sprite[] = [];
  private subTextures = new Map<number, Texture>();

  static readonly TILE_SIZE = 16;

  constructor(texture: Texture, tileset: TextureFilm) {
    super();
    this.texture = texture;
    this.tileset = tileset;
  }

  map(mapData: number[], cols: number): void {
    this.mapData = mapData;
    this.mapWidth = cols;
    this.mapHeight = Math.floor(mapData.length / cols);
    this.size = this.mapWidth * this.mapHeight;

    this.data = new Array(this.size).fill(-1);

    this.removeChildren();
    this.sprites = [];
    for (let i = 0; i < this.size; i++) {
      const sprite = new Sprite(this.texture);
      sprite.visible = false;
      this.addChild(sprite);
      this.sprites.push(sprite);
    }

    this.updateMap();
  }

  updateMap(): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.getTileVisual(i, this.mapData[i]!, false);
    }
    this.refreshAll();
  }

  updateMapCell(cell: number): void {
    if (cell < 0 || cell >= this.size) return;
    this.data[cell] = this.getTileVisual(cell, this.mapData[cell]!, false);
    this.refreshCell(cell);
  }

  protected abstract getTileVisual(pos: number, tile: number, flat: boolean): number;

  protected needsRender(pos: number): boolean {
    return this.data[pos]! >= 0;
  }

  private refreshAll(): void {
    for (let i = 0; i < this.size; i++) {
      const visual = this.data[i]!;
      if (visual >= 0) {
        this.setSprite(i, visual);
      } else {
        this.sprites[i]!.visible = false;
      }
    }
  }

  private refreshCell(cell: number): void {
    const visual = this.data[cell]!;
    if (visual >= 0) {
      this.setSprite(cell, visual);
    } else {
      this.sprites[cell]!.visible = false;
    }
  }

  private setSprite(cell: number, visual: number): void {
    const sprite = this.sprites[cell]!;
    const tex = this.getOrCreateSubTexture(visual);
    sprite.texture = tex;
    const x = (cell % this.mapWidth) * Tilemap.TILE_SIZE;
    const y = Math.floor(cell / this.mapWidth) * Tilemap.TILE_SIZE;
    sprite.position.set(x, y);
    sprite.visible = true;
  }

  private getOrCreateSubTexture(frameId: number): Texture {
    let tex = this.subTextures.get(frameId);
    if (!tex) {
      const rect = this.tileset.get(frameId);
      if (rect) {
        tex = new Texture({
          source: this.texture.source,
          frame: rect,
        });
      } else {
        tex = this.texture;
      }
      this.subTextures.set(frameId, tex);
    }
    return tex;
  }

  destroy(): void {
    super.destroy({ children: true });
    this.subTextures.clear();
  }
}
