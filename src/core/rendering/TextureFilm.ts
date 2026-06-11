// Port of com.watabou.noosa.TextureFilm
// Maps frame IDs to pixel rectangles within a texture

import { Rectangle } from 'pixi.js';

export class TextureFilm {
  private texWidth: number;
  private texHeight: number;
  private frames = new Map<number, Rectangle>();

  constructor(texWidth: number, texHeight: number, tileWidth: number, tileHeight: number) {
    this.texWidth = texWidth;
    this.texHeight = texHeight;

    const cols = Math.floor(texWidth / tileWidth);
    const rows = Math.floor(texHeight / tileHeight);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const rect = new Rectangle(
          j * tileWidth,
          i * tileHeight,
          tileWidth,
          tileHeight
        );
        this.frames.set(i * cols + j, rect);
      }
    }
  }

  get(id: number): Rectangle | undefined {
    return this.frames.get(id);
  }

  width(id: number): number {
    const f = this.frames.get(id);
    return f ? f.width : 0;
  }

  height(id: number): number {
    const f = this.frames.get(id);
    return f ? f.height : 0;
  }

  /** Convert a pixel rect to normalized UV rect */
  uvRect(id: number): Rectangle | undefined {
    const f = this.frames.get(id);
    if (!f) return undefined;
    return new Rectangle(
      f.x / this.texWidth,
      f.y / this.texHeight,
      f.width / this.texWidth,
      f.height / this.texHeight
    );
  }
}
