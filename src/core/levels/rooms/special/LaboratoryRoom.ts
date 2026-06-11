// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.LaboratoryRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { Point } from '../../../utils/Geom';
import * as Random from '../../../utils/Random';
import { Door, DoorType } from '../Room';

export class LaboratoryRoom extends SpecialRoom {

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);
    Painter.fill(level, this, 1, Terrain.EMPTY_SP);

    const entrance = this.entrance();
    if (entrance !== null) {
      entrance.set(DoorType.LOCKED);

      const pot = this.alchemyPos(entrance);
      Painter.set(level, pot, Terrain.ALCHEMY);

      // TODO: seed Alchemy blob
      // TODO: drop EnergyCrystal and prize items
      // TODO: addItemToSpawn new IronKey(Dungeon.depth)
    }
  }

  private alchemyPos(door: Door): Point {
    const p: Point = { x: 0, y: 0 };
    if (door.x === this.left) {
      p.x = this.right - 1;
      p.y = Random.Int(2) === 0 ? this.top + 1 : this.bottom - 1;
    } else if (door.x === this.right) {
      p.x = this.left + 1;
      p.y = Random.Int(2) === 0 ? this.top + 1 : this.bottom - 1;
    } else if (door.y === this.top) {
      p.x = Random.Int(2) === 0 ? this.left + 1 : this.right - 1;
      p.y = this.bottom - 1;
    } else if (door.y === this.bottom) {
      p.x = Random.Int(2) === 0 ? this.left + 1 : this.right - 1;
      p.y = this.top + 1;
    }
    return p;
  }
}
