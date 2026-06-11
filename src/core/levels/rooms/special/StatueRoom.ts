// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.StatueRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { DoorType } from '../Room';

export class StatueRoom extends SpecialRoom {

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);
    Painter.fill(level, this, 1, Terrain.EMPTY);

    const door = this.entrance();
    if (door !== null) {
      door.set(DoorType.LOCKED);

      if (door.x === this.left) {
        Painter.fill(level, this.right - 1, this.top + 1, 1, this.height() - 2, Terrain.STATUE);
      } else if (door.x === this.right) {
        Painter.fill(level, this.left + 1, this.top + 1, 1, this.height() - 2, Terrain.STATUE);
      } else if (door.y === this.top) {
        Painter.fill(level, this.left + 1, this.bottom - 1, this.width() - 2, 1, Terrain.STATUE);
      } else if (door.y === this.bottom) {
        Painter.fill(level, this.left + 1, this.top + 1, this.width() - 2, 1, Terrain.STATUE);
      }
    }

    // TODO: spawn animated Statue mob opposite the entrance
    // TODO: addItemToSpawn new IronKey(Dungeon.depth)
  }
}
