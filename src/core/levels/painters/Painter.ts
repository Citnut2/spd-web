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

import { Level } from '../Level';
import { Room } from '../rooms/Room';
import { Point, Rect, rectWidth, rectHeight } from '../../utils/Geom';

export abstract class Painter {

  // Painters take a level and its collection of rooms, and paint all the specific tile values
  abstract paint(level: Level, rooms: Room[]): boolean;

  // Static utility methods

  static set(level: Level, cell: number, value: number): void;
  static set(level: Level, x: number, y: number, value: number): void;
  static set(level: Level, p: Point, value: number): void;
  static set(level: Level, a: number | Point, b: number, c?: number): void {
    if (typeof a === 'object') {
      level.map[a.x + a.y * level.width] = b;
    } else if (c !== undefined) {
      level.map[a + b * level.width] = c;
    } else {
      level.map[a] = b;
    }
  }

  static fill(level: Level, x: number, y: number, w: number, h: number, value: number): void;
  static fill(level: Level, rect: Rect, value: number): void;
  static fill(level: Level, rect: Rect, m: number, value: number): void;
  static fill(level: Level, rect: Rect, l: number, t: number, r: number, b: number, value: number): void;
  static fill(level: Level, a: Rect | number, b: number, c?: number, d?: number, e?: number, f?: number): void {
    if (typeof a === 'object') {
      const rect = a;
      if (f !== undefined) {
        const l = b, t = c!, r = d!, bVal = e!, val = f;
        Painter.doFill(level, rect.left + l, rect.top + t, rectWidth(rect) - (l + r), rectHeight(rect) - (t + bVal), val);
      } else if (c !== undefined) {
        const m = b, val = c;
        Painter.doFill(level, rect.left + m, rect.top + m, rectWidth(rect) - m * 2, rectHeight(rect) - m * 2, val);
      } else {
        Painter.doFill(level, rect.left, rect.top, rectWidth(rect), rectHeight(rect), b);
      }
    } else {
      Painter.doFill(level, a, b, c!, d!, e!);
    }
  }

  private static doFill(level: Level, x: number, y: number, w: number, h: number, value: number): void {
    const width = level.width;
    let pos = y * width + x;
    for (let i = y; i < y + h; i++, pos += width) {
      for (let j = pos; j < pos + w; j++) {
        level.map[j] = value;
      }
    }
  }

  static drawLine(level: Level, from: Point, to: Point, value: number): void {
    let x = from.x;
    let y = from.y;
    let dx = to.x - from.x;
    let dy = to.y - from.y;

    const movingbyX = Math.abs(dx) >= Math.abs(dy);
    if (movingbyX) {
      dy /= Math.abs(dx);
      dx /= Math.abs(dx);
    } else {
      dx /= Math.abs(dy);
      dy /= Math.abs(dy);
    }

    Painter.set(level, Math.round(x), Math.round(y), value);
    while ((movingbyX && to.x !== x) || (!movingbyX && to.y !== y)) {
      x += dx;
      y += dy;
      Painter.set(level, Math.round(x), Math.round(y), value);
    }
  }

  static fillEllipse(level: Level, rect: Rect, value: number): void;
  static fillEllipse(level: Level, rect: Rect, m: number, value: number): void;
  static fillEllipse(level: Level, x: number, y: number, w: number, h: number, value: number): void;
  static fillEllipse(level: Level, a: Rect | number, b: number, c?: number, d?: number, e?: number): void {
    if (typeof a === 'object') {
      const rect = a;
      if (c !== undefined) {
        const m = b, val = c;
        Painter.doFillEllipse(level, rect.left + m, rect.top + m, rectWidth(rect) - m * 2, rectHeight(rect) - m * 2, val);
      } else {
        Painter.doFillEllipse(level, rect.left, rect.top, rectWidth(rect), rectHeight(rect), b);
      }
    } else {
      Painter.doFillEllipse(level, a, b, c!, d!, e!);
    }
  }

  private static doFillEllipse(level: Level, x: number, y: number, w: number, h: number, value: number): void {
    const radH = h / 2;
    const radW = w / 2;

    for (let i = 0; i < h; i++) {
      const rowY = -radH + 0.5 + i;
      let rowW = 2.0 * Math.sqrt((radW * radW) * (1.0 - (rowY * rowY) / (radH * radH)));

      if (w % 2 === 0) {
        rowW = Math.round(rowW / 2.0) * 2.0;
      } else {
        rowW = Math.floor(rowW / 2.0) * 2.0;
        rowW++;
      }

      const cell = x + (w - rowW) / 2 + ((y + i) * level.width);
      for (let j = cell; j < cell + rowW; j++) {
        level.map[j] = value;
      }
    }
  }

  static fillDiamond(level: Level, rect: Rect, value: number): void;
  static fillDiamond(level: Level, rect: Rect, m: number, value: number): void;
  static fillDiamond(level: Level, x: number, y: number, w: number, h: number, value: number): void;
  static fillDiamond(level: Level, a: Rect | number, b: number, c?: number, d?: number, e?: number): void {
    if (typeof a === 'object') {
      const rect = a;
      if (c !== undefined) {
        const m = b, val = c;
        Painter.doFillDiamond(level, rect.left + m, rect.top + m, rectWidth(rect) - m * 2, rectHeight(rect) - m * 2, val);
      } else {
        Painter.doFillDiamond(level, rect.left, rect.top, rectWidth(rect), rectHeight(rect), b);
      }
    } else {
      Painter.doFillDiamond(level, a, b, c!, d!, e!);
    }
  }

  private static doFillDiamond(level: Level, x: number, y: number, w: number, h: number, value: number): void {
    let diamondWidth = w - (h - 2 - h % 2);
    diamondWidth = Math.max(diamondWidth, w % 2 === 0 ? 2 : 3);

    for (let i = 0; i <= h; i++) {
      Painter.doFill(level, x + (w - diamondWidth) / 2, y + i, diamondWidth, h - 2 * i, value);
      diamondWidth += 2;
      if (diamondWidth > w) break;
    }
  }

  static drawInside(level: Level, room: Room, from: Point, n: number, value: number): Point {
    const step: Point = { x: 0, y: 0 };
    if (from.x === room.left) {
      step.x = 1;
      step.y = 0;
    } else if (from.x === room.right) {
      step.x = -1;
      step.y = 0;
    } else if (from.y === room.top) {
      step.x = 0;
      step.y = 1;
    } else if (from.y === room.bottom) {
      step.x = 0;
      step.y = -1;
    }

    const p: Point = { x: from.x + step.x, y: from.y + step.y };
    for (let i = 0; i < n; i++) {
      if (value !== -1) {
        Painter.set(level, p, value);
      }
      p.x += step.x;
      p.y += step.y;
    }

    return p;
  }
}
