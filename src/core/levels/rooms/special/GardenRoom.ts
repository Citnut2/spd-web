// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.GardenRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { DoorType } from '../Room';

export class GardenRoom extends SpecialRoom {

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);
    Painter.fill(level, this, 1, Terrain.HIGH_GRASS);
    Painter.fill(level, this, 2, Terrain.GRASS);

    const door = this.entrance();
    if (door !== null) {
      door.set(DoorType.LOCKED);
    }

    // TODO: addItemToSpawn new IronKey(Dungeon.depth)
    // TODO: place Sungrass/BlandfruitBush bushes
    // TODO: seed Foliage blob
  }
}
