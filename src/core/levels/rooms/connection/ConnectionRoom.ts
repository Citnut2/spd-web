// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom

import { Room } from '../Room';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';

export abstract class ConnectionRoom extends Room {
  override minWidth(): number {
    return 3;
  }

  override maxWidth(): number {
    return 10;
  }

  override minHeight(): number {
    return 3;
  }

  override maxHeight(): number {
    return 10;
  }

  override minConnections(direction: number): number {
    if (direction === Room.ALL) return 2;
    return 0;
  }

  static createRoom(): ConnectionRoom {
    // Simplified: always returns a basic tunnel-like connection room
    // TODO: implement room type selection per depth when subclasses exist
    return new TunnelConnectionRoom();
  }
}

// Minimal concrete ConnectionRoom used until subclasses are ported
class TunnelConnectionRoom extends ConnectionRoom {
  override paint(level: Level): void {
    // Fill the room's area with empty floor
    const rect = { left: this.left, top: this.top, right: this.right, bottom: this.bottom };
    Painter.fill(level, rect, Terrain.EMPTY);
  }
}
