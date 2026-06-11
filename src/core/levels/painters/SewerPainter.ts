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

import { RegularPainter } from './RegularPainter';
import { Level } from '../Level';
import { Terrain } from '../Terrain';
import { Room } from '../rooms/Room';
import * as Random from '../../utils/Random';

export class SewerPainter extends RegularPainter {

  override decorate(level: Level, _rooms: Room[]): void {
    for (let i = 0; i < level.width; i++) {
      const cell = i;
      if (level.map[cell] === Terrain.WALL) {
        const below = cell + level.width;
        if (level.map[below] === Terrain.WATER && Random.Float() < 0.25) {
          level.map[cell] = Terrain.WALL_DECO;
        }
      }
    }

    for (let i = level.length - level.width; i < level.length; i++) {
      const cell = i;
      if (level.map[cell] === Terrain.WALL) {
        const above = cell - level.width;
        if (level.map[above] === Terrain.WATER && Random.Float() < 0.50) {
          level.map[cell] = Terrain.WALL_DECO;
        }
      }
    }

    for (let i = 0; i < level.length; i++) {
      if (level.map[i] === Terrain.EMPTY) {
        let wallCount = 0;
        for (const n of level.getNeighbours4(i)) {
          if (level.map[n] === Terrain.WALL || level.map[n] === Terrain.WALL_DECO) {
            wallCount++;
          }
        }
        if (Random.Float() < (wallCount * wallCount) / 16) {
          level.map[i] = Terrain.EMPTY_DECO;
        }
      }
    }
  }
}
