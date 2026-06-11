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

import { Float as RandFloat, IntRange } from '../utils/Random';

export class Patch {

  /*
   * fill is the initial seeded fill rate when creating a random boolean array.
   *
   * clustering is the number of clustering passes done on the array, to create patches.
   * each clustering pass is basically a 3x3 mask filter but with rounding to true or false.
   * high clustering values will produce more concentrated patches,
   * but any amount of clustering will rapidly push fill rates towards 1.0f or 0.0f.
   * The closer the fill rate is to 0.5f the weaker this pushing will be.
   *
   * forceFillRate adjusts the algorithm to force fill rate to be consistent despite clustering.
   * this is achieved by firstly pulling the initial fill value towards 0.5f
   * and then by manually filling in or emptying cells after clustering, until the fill rate is
   * achieved. This is tracked with the fillDiff variable.
   */
  static generate(w: number, h: number, fill: number, clustering: number, forceFillRate: boolean): boolean[] {
    const length = w * h;

    let cur: boolean[] = new Array(length);
    let off: boolean[] = new Array(length);

    let fillDiff = -Math.round(length * fill);

    if (forceFillRate && clustering > 0) {
      fill += (0.5 - fill) * 0.5;
    }

    for (let i = 0; i < length; i++) {
      off[i] = RandFloat() < fill;
      if (off[i]) fillDiff++;
    }

    for (let iter = 0; iter < clustering; iter++) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const pos = x + y * w;
          let count = 0;
          let neighbours = 0;

          if (y > 0) {
            if (x > 0) {
              if (off[pos - w - 1]) count++;
              neighbours++;
            }
            if (off[pos - w]) count++;
            neighbours++;
            if (x < (w - 1)) {
              if (off[pos - w + 1]) count++;
              neighbours++;
            }
          }

          if (x > 0) {
            if (off[pos - 1]) count++;
            neighbours++;
          }
          if (off[pos]) count++;
          neighbours++;
          if (x < (w - 1)) {
            if (off[pos + 1]) count++;
            neighbours++;
          }

          if (y < (h - 1)) {
            if (x > 0) {
              if (off[pos + w - 1]) count++;
              neighbours++;
            }
            if (off[pos + w]) count++;
            neighbours++;
            if (x < (w - 1)) {
              if (off[pos + w + 1]) count++;
              neighbours++;
            }
          }

          cur[pos] = 2 * count >= neighbours;
          if (cur[pos] !== off[pos]) fillDiff += cur[pos] ? 1 : -1;
        }
      }

      const tmp = cur;
      cur = off;
      off = tmp;
    }

    if (forceFillRate && Math.min(w, h) > 2) {
      const neighbours = [-w - 1, -w, -w + 1, -1, 0, 1, w - 1, w, w + 1];
      const growing = fillDiff < 0;

      while (fillDiff !== 0) {
        let cell = 0;
        let tries = 0;
        do {
          cell = IntRange(1, w - 1) + IntRange(1, h - 1) * w;
          tries++;
        } while (off[cell] !== growing && tries * 10 < length);

        for (let k = 0; k < neighbours.length; k++) {
          const n = neighbours[k]!;
          if (fillDiff !== 0 && off[cell + n] !== growing) {
            off[cell + n] = growing;
            fillDiff += growing ? 1 : -1;
          }
        }
      }
    }

    return off;
  }
}
