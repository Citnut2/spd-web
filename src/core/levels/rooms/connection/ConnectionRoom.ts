// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom

import { Room } from '../Room';

export abstract class ConnectionRoom extends Room {
  override minWidth(): number { return 3; }
  override maxWidth(): number { return 10; }
  override minHeight(): number { return 3; }
  override maxHeight(): number { return 10; }

  override minConnections(direction: number): number {
    if (direction === Room.ALL) return 2;
    return 0;
  }
}
