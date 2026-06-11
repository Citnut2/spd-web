// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.PoolRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { DoorType } from '../Room';

export class PoolRoom extends SpecialRoom {

  override minWidth(): number { return 6; }
  override minHeight(): number { return 6; }

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);
    Painter.fill(level, this, 1, Terrain.WATER);

    const door = this.entrance();
    if (door !== null) {
      door.set(DoorType.REGULAR);

      let x: number;
      let y: number;
      if (door.x === this.left) {
        x = this.right - 1;
        y = this.top + (this.height() >> 1);
        Painter.fill(level, this.left + 1, this.top + 1, 1, this.height() - 2, Terrain.EMPTY_SP);
      } else if (door.x === this.right) {
        x = this.left + 1;
        y = this.top + (this.height() >> 1);
        Painter.fill(level, this.right - 1, this.top + 1, 1, this.height() - 2, Terrain.EMPTY_SP);
      } else if (door.y === this.top) {
        x = this.left + (this.width() >> 1);
        y = this.bottom - 1;
        Painter.fill(level, this.left + 1, this.top + 1, this.width() - 2, 1, Terrain.EMPTY_SP);
      } else {
        x = this.left + (this.width() >> 1);
        y = this.top + 1;
        Painter.fill(level, this.left + 1, this.bottom - 1, this.width() - 2, 1, Terrain.EMPTY_SP);
      }

      const cell = level.pointToCell(x, y);
      Painter.set(level, cell, Terrain.PEDESTAL);
      // TODO: drop prize item
      // TODO: addItemToSpawn PotionOfInvisibility
      // TODO: spawn Piranha mobs
    }
  }
}
