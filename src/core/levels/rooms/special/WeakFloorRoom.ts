// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { Point } from '../../../utils/Geom';
import * as Random from '../../../utils/Random';
import { Door, DoorType } from '../Room';

export class WeakFloorRoom extends SpecialRoom {

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);
    Painter.fill(level, this, 1, Terrain.CHASM);

    const door = this.entrance();
    if (door !== null) {
      door.set(DoorType.REGULAR);

      const well = this.wellPos(door, level);
      Painter.set(level, well, Terrain.CHASM);
      // TODO: add custom tilemap for hidden well
      // TODO: seed WellID blob
    }
  }

  private wellPos(door: Door, _level: Level): Point {
    const p: Point = { x: 0, y: 0 };
    if (door.x === this.left) {
      for (let i = this.top + 1; i < this.bottom; i++) {
        Painter.drawInside(_level, this, { x: this.left, y: i }, Random.IntRange(1, this.width() - 4), Terrain.EMPTY_SP);
      }
      p.x = this.right - 1;
      p.y = Random.Int(2) === 0 ? this.top + 2 : this.bottom - 1;
    } else if (door.x === this.right) {
      for (let i = this.top + 1; i < this.bottom; i++) {
        Painter.drawInside(_level, this, { x: this.right, y: i }, Random.IntRange(1, this.width() - 4), Terrain.EMPTY_SP);
      }
      p.x = this.left + 1;
      p.y = Random.Int(2) === 0 ? this.top + 2 : this.bottom - 1;
    } else if (door.y === this.top) {
      for (let i = this.left + 1; i < this.right; i++) {
        Painter.drawInside(_level, this, { x: i, y: this.top }, Random.IntRange(1, this.height() - 4), Terrain.EMPTY_SP);
      }
      p.x = Random.Int(2) === 0 ? this.left + 1 : this.right - 1;
      p.y = this.bottom - 1;
    } else if (door.y === this.bottom) {
      for (let i = this.left + 1; i < this.right; i++) {
        Painter.drawInside(_level, this, { x: i, y: this.bottom }, Random.IntRange(1, this.height() - 4), Terrain.EMPTY_SP);
      }
      p.x = Random.Int(2) === 0 ? this.left + 1 : this.right - 1;
      p.y = this.top + 2;
    }
    return p;
  }
}
