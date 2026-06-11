// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite

import { Container, Sprite, Texture, Assets } from 'pixi.js';
import { ItemSpriteSheet } from './ItemSpriteSheet';
import { TextureFilm } from '../rendering/TextureFilm';
import { DungeonTilemap } from '../rendering/DungeonTilemap';
import type { Item } from '../items/Item';
import type { Heap } from '../items/Heap';
import { Dungeon } from '../levels/Dungeon';

export class ItemSprite extends Container {
  static readonly SIZE = 16;
  private static readonly DROP_INTERVAL = 0.4;

  heap: Heap | null = null;

  private sprite: Sprite;
  private dropTimer = 0;
  private dropSpeedY = 0;
  private dropAccelY = 0;

  protected perspectiveRaise = 5 / 16;

  constructor(image = ItemSpriteSheet.SOMETHING, glowing: Glowing | null = null) {
    super();
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 1);
    this.addChild(this.sprite);
    this.setView(image, glowing);
  }

  setViewFromItem(item: Item): this {
    this.setView(item.image, (item as any).glowing ? (item as any).glowing() : null);
    return this;
  }

  setViewFromHeap(heap: Heap): this {
    if (heap.size() <= 0 || !heap.items || !heap.peek()) {
      return this.setView(0, null);
    }
    this.setViewFromItem(heap.peek()!);
    this.alpha = heap.hidden ? 0.15 : 1;
    return this;
  }

  setView(image: number, _glowing: Glowing | null): this {
    const film = new TextureFilm(256, 512, ItemSpriteSheet.SIZE, ItemSpriteSheet.SIZE);
    const rect = film.get(image);
    const tex = Assets.get('assets/sprites/items.png') as Texture;
    if (tex && rect) {
      this.sprite.texture = new Texture({ source: tex.source, frame: rect.clone() });
    }
    this.sprite.tint = 0xFFFFFF;
    return this;
  }

  link(heap: Heap): void {
    this.heap = heap;
    this.setViewFromHeap(heap);
    this.place(heap.pos);
  }

  place(cell: number): void {
    const p = this.worldToCamera(cell);
    this.position.set(p.x, p.y);
  }

  worldToCamera(cell: number): { x: number; y: number } {
    if (!Dungeon.level) {
      return { x: 0, y: 0 };
    }
    const csize = DungeonTilemap.SIZE;
    const w = Dungeon.level.width;
    const x = ((cell % w) + 0.5) * csize - ItemSpriteSheet.SIZE * 0.5;
    const y = (Math.floor(cell / w) + 1) * csize - ItemSpriteSheet.SIZE - csize * this.perspectiveRaise;
    return { x: Math.round(x), y: Math.round(y) };
  }

  drop(): void {
    if (this.heap && this.heap.isEmpty()) return;
    if (this.heap && this.heap.size() === 1) {
      this.place(this.heap.pos);
    }
    this.dropTimer = ItemSprite.DROP_INTERVAL;
    this.dropSpeedY = -100;
    this.dropAccelY = -this.dropSpeedY / ItemSprite.DROP_INTERVAL * 2;
  }

  dropFrom(from: number): void {
    if (this.heap && this.heap.pos === from) {
      this.drop();
    } else {
      const px = this.x;
      this.drop();
      this.place(from);
      this.dropSpeedY = (px - this.x) / ItemSprite.DROP_INTERVAL;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  itemUpdate(_dt?: number): void {
    if (this.dropTimer > 0) {
      this.dropTimer -= 1 / 60;
      this.position.y += this.dropSpeedY * (1 / 60);
      this.dropSpeedY += this.dropAccelY * (1 / 60);

      if (this.dropTimer <= 0) {
        this.dropTimer = 0;
        this.dropSpeedY = 0;
        this.dropAccelY = 0;
        if (this.heap) {
          this.place(this.heap.pos);
        }
      }
    }
  }

  static pick(index: number, x: number, y: number): number {
    const rows = 256 / ItemSpriteSheet.SIZE;
    const row = Math.floor(index / rows);
    const col = index % rows;
    return col * ItemSpriteSheet.SIZE + x + (row * ItemSpriteSheet.SIZE + y) * 256;
  }
}

export class Glowing {
  color: number;
  red: number;
  green: number;
  blue: number;
  period: number;

  constructor(color: number, period = 1) {
    this.color = color;
    this.red = ((color >> 16) & 0xFF) / 255;
    this.green = ((color >> 8) & 0xFF) / 255;
    this.blue = (color & 0xFF) / 255;
    this.period = period;
  }
}
