// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.RingTunnelRoom

import { TunnelRoom } from './TunnelRoom';
import { Level } from '../../Level';
import { Painter } from '../../painters/Painter';
import { Terrain } from '../../Terrain';
import { gate, Rect } from '../../../utils/Geom';

export class RingTunnelRoom extends TunnelRoom {

  override minWidth(): number {
    return Math.max(5, super.minWidth());
  }

  override minHeight(): number {
    return Math.max(5, super.minHeight());
  }

  override paint(level: Level): void {
    super.paint(level);

    const floor = level.tunnelTile();
    const ring = this.getRingConnectionSpace();

    Painter.fill(level, ring.left, ring.top, 3, 3, floor);
    Painter.fill(level, ring.left + 1, ring.top + 1, 1, 1, Terrain.WALL);
  }

  private connSpace: Rect | null = null;
  private ringConnSpace: Rect | null = null;

  protected override getConnectionSpace(): Rect {
    if (this.connSpace == null) {
      const c = this.getDoorCenter();
      c.x = gate(this.left + 2, c.x, this.right - 2);
      c.y = gate(this.top + 2, c.y, this.bottom - 2);
      this.connSpace = { left: c.x - 1, top: c.y - 1, right: c.x + 1, bottom: c.y + 1 };
    }
    return this.connSpace;
  }

  private getRingConnectionSpace(): Rect {
    if (this.ringConnSpace == null) {
      this.ringConnSpace = this.getConnectionSpace();
    }
    return this.ringConnSpace;
  }
}
