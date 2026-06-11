// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicWellRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { DoorType } from '../Room';

export class MagicWellRoom extends SpecialRoom {

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);
    Painter.fill(level, this, 1, Terrain.EMPTY);

    const c = this.center();
    Painter.set(level, c.x, c.y, Terrain.WELL);

    const door = this.entrance();
    if (door !== null) {
      door.set(DoorType.LOCKED);
    }

    // TODO: seed WellWater blob (WaterOfAwareness or WaterOfHealth)
    // TODO: addItemToSpawn new IronKey(Dungeon.depth)
  }
}
