// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.TrapsRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import * as Random from '../../../utils/Random';
import { DoorType } from '../Room';

export class TrapsRoom extends SpecialRoom {

  override minWidth(): number { return 6; }
  override maxWidth(): number { return 8; }

  override minHeight(): number { return 6; }
  override maxHeight(): number { return 8; }

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);

    if (Random.Int(4) === 0) {
      Painter.fill(level, this, 1, Terrain.CHASM);
    } else {
      Painter.fill(level, this, 1, Terrain.TRAP);
    }

    const door = this.entrance();
    if (door !== null) {
      door.set(DoorType.REGULAR);

      const lastRow = level.map[this.left + 1 + (this.top + 1) * level.width] === Terrain.CHASM
        ? Terrain.CHASM : Terrain.EMPTY;

      let px: number;
      let py: number;
      if (door.x === this.left) {
        px = this.right - 1;
        py = this.top + (this.height() >> 1);
        Painter.fill(level, px, this.top + 1, 1, this.height() - 2, lastRow);
      } else if (door.x === this.right) {
        px = this.left + 1;
        py = this.top + (this.height() >> 1);
        Painter.fill(level, px, this.top + 1, 1, this.height() - 2, lastRow);
      } else if (door.y === this.top) {
        px = this.left + (this.width() >> 1);
        py = this.bottom - 1;
        Painter.fill(level, this.left + 1, py, this.width() - 2, 1, lastRow);
      } else {
        px = this.left + (this.width() >> 1);
        py = this.top + 1;
        Painter.fill(level, this.left + 1, py, this.width() - 2, 1, lastRow);
      }

      const pos = level.pointToCell(px, py);
      Painter.set(level, pos, Terrain.PEDESTAL);
      // TODO: drop prize item as chest
      // TODO: set traps on all TRAP tiles
      // TODO: addItemToSpawn PotionOfLevitation
    }
  }
}
