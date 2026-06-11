// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.TunnelRoom

import { ConnectionRoom } from './ConnectionRoom';
import { Level } from '../../Level';
import { Painter } from '../../painters/Painter';
import { Point, Rect, gate, rectWidth, rectHeight } from '../../../utils/Geom';
import * as Random from '../../../utils/Random';
import { PathFinder } from '../../../utils/PathFinder';
import { DoorType } from '../Room';

export class TunnelRoom extends ConnectionRoom {

  paint(level: Level): void {
    const floor = level.tunnelTile();
    const c = this.getConnectionSpace();

    for (const door of this.connected.values()) {
      let start: Point;
      let mid: Point;
      let end: Point;

      start = { x: door.x, y: door.y };
      if (start.x === this.left) start.x++;
      else if (start.y === this.top) start.y++;
      else if (start.x === this.right) start.x--;
      else if (start.y === this.bottom) start.y--;

      let rightShift: number;
      let downShift: number;

      if (start.x < c.left) rightShift = c.left - start.x;
      else if (start.x > c.right) rightShift = c.right - start.x;
      else rightShift = 0;

      if (start.y < c.top) downShift = c.top - start.y;
      else if (start.y > c.bottom) downShift = c.bottom - start.y;
      else downShift = 0;

      if (door.x === this.left || door.x === this.right) {
        mid = { x: start.x + rightShift, y: start.y };
        end = { x: mid.x, y: mid.y + downShift };
      } else {
        mid = { x: start.x, y: start.y + downShift };
        end = { x: mid.x + rightShift, y: mid.y };
      }

      Painter.drawLine(level, start, mid, floor);
      Painter.drawLine(level, mid, end, floor);
    }

    if (this.width() >= 7 && this.height() >= 7 && this.connected.size >= 4
      && rectWidth(this.getConnectionSpace()) === 0 && rectHeight(this.getConnectionSpace()) === 0) {
      const c = this.getConnectionSpace();
      const cell = level.pointToCell({ x: c.left, y: c.top });
      const ofs = 2 * Random.Int(4);

      if (level.map[cell + PathFinder.CIRCLE8[(ofs + 7) % 8]!] === floor
        && level.map[cell + PathFinder.CIRCLE8[(ofs + 1) % 8]!] === floor) {
        Painter.set(level, cell + PathFinder.CIRCLE8[ofs]!, floor);
      }
    }

    for (const door of this.connected.values()) {
      door.set(DoorType.TUNNEL);
    }
  }

  protected getConnectionSpace(): Rect {
    const c = this.getDoorCenter();
    return { left: c.x, top: c.y, right: c.x, bottom: c.y };
  }

  protected getDoorCenter(): Point {
    let cx = 0;
    let cy = 0;

    for (const door of this.connected.values()) {
      cx += door.x;
      cy += door.y;
    }

    const avgX = cx / this.connected.size;
    const avgY = cy / this.connected.size;
    const result: Point = { x: Math.floor(avgX), y: Math.floor(avgY) };
    if (Random.Float() < avgX % 1) result.x++;
    if (Random.Float() < avgY % 1) result.y++;
    result.x = gate(this.left + 1, result.x, this.right - 1);
    result.y = gate(this.top + 1, result.y, this.bottom - 1);

    return result;
  }
}

