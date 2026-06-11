// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom

import { Room, Door } from '../Room';
import { Point } from '../../../utils/Geom';

export abstract class SpecialRoom extends Room {

  override minWidth(): number { return 5; }
  override maxWidth(): number { return 10; }

  override minHeight(): number { return 5; }
  override maxHeight(): number { return 10; }

  override maxConnections(_direction: number): number {
    return 1;
  }

  private _entrance: Door | null = null;

  entrance(): Door | null {
    if (this._entrance === null && this.connected.size > 0) {
      this._entrance = this.connected.values().next().value ?? null;
    }
    return this._entrance;
  }

  override canPlaceTrap(_p: Point): boolean {
    return true;
  }

  override canPlaceGrass(_p: Point): boolean {
    return true;
  }
}
