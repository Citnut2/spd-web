// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.BridgeRoom

import { TunnelRoom } from './TunnelRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { Room } from '../Room';
import { Point } from '../../../utils/Geom';

export class BridgeRoom extends TunnelRoom {

  override paint(level: Level): void {
    if (Math.min(this.width(), this.height()) > 3) {
      Painter.fill(level, this, 1, Terrain.CHASM);
    }

    super.paint(level);

    for (const r of this.neighbours) {
      if (r.constructor.name === 'BridgeRoom'
        || r.constructor.name === 'RingBridgeRoom'
        || r.constructor.name === 'WalkwayRoom') {
        const i = this.intersect(r);
        if (i.right - i.left !== 0) {
          i.left++;
          i.right--;
        } else {
          i.top++;
          i.bottom--;
        }
        Painter.fill(level, i.left, i.top, i.right - i.left + 1, i.bottom - i.top + 1, Terrain.CHASM);
      }
    }
  }

  override canMerge(_l: Level, _other: Room, _p: Point, mergeTerrain: number): boolean {
    return mergeTerrain === Terrain.CHASM;
  }
}
