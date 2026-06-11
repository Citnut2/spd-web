/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2025 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

// Port of com.shatteredpixel.shatteredpixeldungeon.tiles.FogOfWar
// Uses HTML Canvas + PixiJS RenderTexture for visibility overlay

import { Container, Sprite, Texture } from 'pixi.js';
import { wallStitcheable } from './DungeonTileSheet';
import { DungeonTilemap } from './DungeonTilemap';
import { Rect } from '../utils/Geom';

export class FogOfWar extends Container {

  // first index is visibility type, second is brightness level
  private static readonly FOG_COLORS: ReadonlyArray<ReadonlyArray<number>> = [
    // VISIBLE - fully transparent
    [0x00000000, 0x00000000, 0x00000000],
    // VISITED - dark semi-transparent
    [0xCC000000, 0x99000000, 0x55000000],
    // MAPPED - blue-tinted
    [0xCC112244, 0x99193366, 0x55224488],
    // INVISIBLE - fully opaque black
    [0xFF000000, 0xFF000000, 0xFF000000],
  ];

  private static readonly VISIBLE   = 0;
  private static readonly VISITED   = 1;
  private static readonly MAPPED    = 2;
  private static readonly INVISIBLE = 3;

  // should be divisible by 2
  private static readonly PIX_PER_TILE = 2;

  private mapWidth: number;
  private mapHeight: number;
  private mapLength: number;

  private pWidth: number;
  private pHeight: number;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sprite: Sprite;

  private toUpdate: Rect[];
  private updating: Rect[];

  constructor(mapWidth: number, mapHeight: number) {
    super();

    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.mapLength = mapHeight * mapWidth;

    this.pWidth = mapWidth * FogOfWar.PIX_PER_TILE;
    this.pHeight = mapHeight * FogOfWar.PIX_PER_TILE;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.pWidth;
    this.canvas.height = this.pHeight;
    this.ctx = this.canvas.getContext('2d')!;

    this.sprite = new Sprite();

    const scale = DungeonTilemap.SIZE / FogOfWar.PIX_PER_TILE;
    this.sprite.scale.set(scale);
    this.sprite.eventMode = 'none';
    this.addChild(this.sprite);

    // Initialize with all black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.pWidth, this.pHeight);
    this.sprite.texture = Texture.from(this.canvas);

    this.toUpdate = [];
    this.toUpdate.push({ left: 0, top: 0, right: mapWidth, bottom: mapHeight });
    this.updating = [];
  }

  // ── Dirty rect scheduling ───────────────────────────────────────────────

  // Full fog update
  updateFog(): void {
    this.toUpdate.length = 0;
    this.toUpdate.push({ left: 0, top: 0, right: this.mapWidth, bottom: this.mapHeight });
  }

  // Add a rectangular region for update, merging with existing rects when overlapping
  updateFogRect(update: Rect): void {
    for (let i = 0; i < this.toUpdate.length; i++) {
      const r = this.toUpdate[i]!;
      // Check intersection
      const ix = Math.max(r.left, update.left);
      const iy = Math.max(r.top, update.top);
      const ir = Math.min(r.right, update.right);
      const ib = Math.min(r.bottom, update.bottom);
      if (ir > ix && ib > iy) {
        // Merge: union of r and update
        this.toUpdate[i] = {
          left:   Math.min(r.left, update.left),
          top:    Math.min(r.top, update.top),
          right:  Math.max(r.right, update.right),
          bottom: Math.max(r.bottom, update.bottom),
        };
        return;
      }
    }
    this.toUpdate.push(update);
  }

  // Update fog around a cell with a given radius
  updateFogCell(cell: number, radius: number): void {
    const update: Rect = {
      left:   (cell % this.mapWidth) - radius,
      top:    Math.floor(cell / this.mapWidth) - radius,
      right:  (cell % this.mapWidth) - radius + 1 + 2 * radius,
      bottom: Math.floor(cell / this.mapWidth) - radius + 1 + 2 * radius,
    };
    update.left   = Math.max(0, update.left);
    update.top    = Math.max(0, update.top);
    update.right  = Math.min(this.mapWidth, update.right);
    update.bottom = Math.min(this.mapHeight, update.bottom);
    if (update.right <= update.left || update.bottom <= update.top) return;
    this.updateFogRect(update);
  }

  // Update fog in a rectangular area
  updateFogArea(x: number, y: number, w: number, h: number): void {
    this.updateFogRect({ left: x, top: y, right: x + w, bottom: y + h });
  }

  // ── Core rendering ──────────────────────────────────────────────────────

  // Called each frame from the render loop
  updateTexture(
    visible: boolean[],
    visited: boolean[],
    mapped: boolean[],
    map: number[],
    discoverable: boolean[],
    brightness: number,
  ): void {
    if (this.toUpdate.length === 0) return;

    this.updating = this.toUpdate;
    this.toUpdate = [];

    const bi = Math.min(2, Math.max(0, brightness + 1));
    const colors = FogOfWar.FOG_COLORS;

    let fullUpdate = false;
    if (this.updating.length === 1) {
      const u = this.updating[0]!;
      if (u.bottom - u.top === this.mapHeight && u.right - u.left === this.mapWidth) {
        fullUpdate = true;
      }
    }

    for (const update of this.updating) {
      for (let i = update.top; i < update.bottom; i++) {
        let cell = this.mapWidth * i + update.left;
        for (let j = update.left; j < update.right; j++) {

          if (cell >= this.mapLength) continue;

          if (!discoverable[cell] || (!visible[cell] && !visited[cell] && !mapped[cell])) {
            if (fullUpdate) {
              this.fillCell(j, i, colors[FogOfWar.INVISIBLE]![bi]!);
            }
            cell++;
            continue;
          }

          // Wall tiles
          if (this.wall(cell, map)) {

            // Always dark if nothing is beneath them
            if (cell + this.mapWidth >= this.mapLength) {
              this.fillCell(j, i, colors[FogOfWar.INVISIBLE]![bi]!);

            // Internal wall tiles - check left and right sides independently
            } else if (this.wall(cell + this.mapWidth, map)) {

              // Left side
              if (j !== 0) {
                if (this.wall(cell - 1, map)) {
                  if (this.wall(cell + this.mapWidth - 1, map)) {
                    this.fillLeft(j, i, colors[FogOfWar.INVISIBLE]![bi]!);
                  } else {
                    this.fillLeft(j, i, colors![
                      Math.max(
                        this.getCellFog(cell, visible, visited, mapped),
                        Math.max(
                          this.getCellFog(cell + this.mapWidth - 1, visible, visited, mapped),
                          this.getCellFog(cell - 1, visible, visited, mapped),
                        ),
                      )
                    ]![bi]!);
                  }
                } else {
                  this.fillLeft(j, i, colors![
                    Math.max(
                      this.getCellFog(cell, visible, visited, mapped),
                      this.getCellFog(cell - 1, visible, visited, mapped),
                    )
                  ]![bi]!);
                }
              } else {
                this.fillLeft(j, i, colors[FogOfWar.INVISIBLE]![bi]!);
              }

              // Right side
              if ((cell + 1) % this.mapWidth !== 0) {
                if (this.wall(cell + 1, map)) {
                  if (this.wall(cell + this.mapWidth + 1, map)) {
                    this.fillRight(j, i, colors[FogOfWar.INVISIBLE]![bi]!);
                  } else {
                    this.fillRight(j, i, colors![
                      Math.max(
                        this.getCellFog(cell, visible, visited, mapped),
                        Math.max(
                          this.getCellFog(cell + this.mapWidth + 1, visible, visited, mapped),
                          this.getCellFog(cell + 1, visible, visited, mapped),
                        ),
                      )
                    ]![bi]!);
                  }
                } else {
                  this.fillRight(j, i, colors![
                    Math.max(
                      this.getCellFog(cell, visible, visited, mapped),
                      this.getCellFog(cell + 1, visible, visited, mapped),
                    )
                  ]![bi]!);
                }
              } else {
                this.fillRight(j, i, colors[FogOfWar.INVISIBLE]![bi]!);
              }

            // Camera-facing wall tiles - darkest between themselves and below
            } else {
              this.fillCell(j, i, colors![
                Math.max(
                  this.getCellFog(cell, visible, visited, mapped),
                  this.getCellFog(cell + this.mapWidth, visible, visited, mapped),
                )
              ]![bi]!);
            }

          // Non-wall tiles - just their direct fog value
          } else {
            this.fillCell(j, i, colors![this.getCellFog(cell, visible, visited, mapped)]![bi]!);
          }

          cell++;
        }
      }
    }

    this.sprite.texture = Texture.from(this.canvas);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private wall(cell: number, map: number[]): boolean {
    return wallStitcheable(map[cell]!);
  }

  private getCellFog(
    cell: number,
    visible: boolean[],
    visited: boolean[],
    mapped: boolean[],
  ): number {
    if (visible[cell]) return FogOfWar.VISIBLE;
    if (visited[cell]) return FogOfWar.VISITED;
    if (mapped[cell])  return FogOfWar.MAPPED;
    return FogOfWar.INVISIBLE;
  }

  // Convert ARGB (0xAARRGGBB) to rgba CSS string
  private argbToRgba(color: number): string {
    const a = (color >>> 24) & 0xFF;
    const r = (color >>> 16) & 0xFF;
    const g = (color >>> 8) & 0xFF;
    const b = color & 0xFF;
    if (a === 0) { return 'rgba(0,0,0,0)'; }
    return `rgba(${r},${g},${b},${a / 255})`;
  }

  private clearCell(x: number, y: number, w: number, h: number): void {
    this.ctx.clearRect(x, y, w, h);
  }

  private fillCell(cellX: number, cellY: number, argb: number): void {
    const x = cellX * FogOfWar.PIX_PER_TILE;
    const y = cellY * FogOfWar.PIX_PER_TILE;
    if ((argb >>> 24) === 0) {
      this.clearCell(x, y, FogOfWar.PIX_PER_TILE, FogOfWar.PIX_PER_TILE);
    } else {
      this.ctx.fillStyle = this.argbToRgba(argb);
      this.ctx.fillRect(x, y, FogOfWar.PIX_PER_TILE, FogOfWar.PIX_PER_TILE);
    }
  }

  private fillLeft(cellX: number, cellY: number, argb: number): void {
    const x = cellX * FogOfWar.PIX_PER_TILE;
    const y = cellY * FogOfWar.PIX_PER_TILE;
    if ((argb >>> 24) === 0) {
      this.clearCell(x, y, FogOfWar.PIX_PER_TILE / 2, FogOfWar.PIX_PER_TILE);
    } else {
      this.ctx.fillStyle = this.argbToRgba(argb);
      this.ctx.fillRect(x, y, FogOfWar.PIX_PER_TILE / 2, FogOfWar.PIX_PER_TILE);
    }
  }

  private fillRight(cellX: number, cellY: number, argb: number): void {
    const x = cellX * FogOfWar.PIX_PER_TILE + FogOfWar.PIX_PER_TILE / 2;
    const y = cellY * FogOfWar.PIX_PER_TILE;
    if ((argb >>> 24) === 0) {
      this.clearCell(x, y, FogOfWar.PIX_PER_TILE / 2, FogOfWar.PIX_PER_TILE);
    } else {
      this.ctx.fillStyle = this.argbToRgba(argb);
      this.ctx.fillRect(x, y, FogOfWar.PIX_PER_TILE / 2, FogOfWar.PIX_PER_TILE);
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  override destroy(): void {
    this.sprite.destroy();
    super.destroy();
  }
}
