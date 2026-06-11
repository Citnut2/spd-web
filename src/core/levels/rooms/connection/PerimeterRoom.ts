// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.PerimeterRoom

import { ConnectionRoom } from './ConnectionRoom';
import { Level } from '../../Level';
import { Painter } from '../../painters/Painter';
import { Point } from '../../../utils/Geom';
import { DoorType } from '../Room';

export class PerimeterRoom extends ConnectionRoom {

  paint(level: Level): void {
    const floor = level.tunnelTile();
    PerimeterRoom.fillPerimeterPaths(level, this, floor);

    for (const door of this.connected.values()) {
      door.set(DoorType.TUNNEL);
    }
  }

  static fillPerimeterPaths(l: Level, r: PerimeterRoom, floor: number): void {
    corners = null;

    const pointsToFill: Point[] = [];
    for (const door of r.connected.values()) {
      const p: Point = { x: door.x, y: door.y };
      if (p.y === r.top) {
        p.y++;
      } else if (p.y === r.bottom) {
        p.y--;
      } else if (p.x === r.left) {
        p.x++;
      } else {
        p.x--;
      }
      pointsToFill.push(p);
    }

    const pointsFilled: Point[] = [];
    pointsFilled.push(pointsToFill.shift()!);

    let from: Point | null = null;
    let to: Point | null = null;
    let shortestDistance: number;
    while (pointsToFill.length > 0) {
      shortestDistance = Number.MAX_SAFE_INTEGER;
      for (const f of pointsFilled) {
        for (const t of pointsToFill) {
          const dist = PerimeterRoom.distanceBetweenPoints(r, f, t);
          if (dist < shortestDistance) {
            from = f;
            to = t;
            shortestDistance = dist;
          }
        }
      }
      PerimeterRoom.fillBetweenPoints(l, r, from!, to!, floor);
      pointsFilled.push(to!);
      const idx = pointsToFill.indexOf(to!);
      if (idx >= 0) pointsToFill.splice(idx, 1);
    }
  }

  private static spaceBetween(a: number, b: number): number {
    return Math.abs(a - b) - 1;
  }

  private static distanceBetweenPoints(r: PerimeterRoom, a: Point, b: Point): number {
    if (((a.x === r.left + 1 || a.x === r.right - 1) && a.y === b.y)
      || ((a.y === r.top + 1 || a.y === r.bottom - 1) && a.x === b.x)) {
      return Math.max(PerimeterRoom.spaceBetween(a.x, b.x), PerimeterRoom.spaceBetween(a.y, b.y));
    }

    return Math.min(
      PerimeterRoom.spaceBetween(r.left, a.x) + PerimeterRoom.spaceBetween(r.left, b.x),
      PerimeterRoom.spaceBetween(r.right, a.x) + PerimeterRoom.spaceBetween(r.right, b.x)
    )
      +
      Math.min(
        PerimeterRoom.spaceBetween(r.top, a.y) + PerimeterRoom.spaceBetween(r.top, b.y),
        PerimeterRoom.spaceBetween(r.bottom, a.y) + PerimeterRoom.spaceBetween(r.bottom, b.y)
      )
      - 1;
  }

  private static fillBetweenPoints(level: Level, r: PerimeterRoom, from: Point, to: Point, floor: number): void {
    if (((from.x === r.left + 1 || from.x === r.right - 1) && from.x === to.x)
      || ((from.y === r.top + 1 || from.y === r.bottom - 1) && from.y === to.y)) {
      Painter.fill(level,
        Math.min(from.x, to.x),
        Math.min(from.y, to.y),
        PerimeterRoom.spaceBetween(from.x, to.x) + 2,
        PerimeterRoom.spaceBetween(from.y, to.y) + 2,
        floor);
      return;
    }

    if (corners == null) {
      corners = [
        { x: r.left + 1, y: r.top + 1 },
        { x: r.right - 1, y: r.top + 1 },
        { x: r.right - 1, y: r.bottom - 1 },
        { x: r.left + 1, y: r.bottom - 1 }
      ];
    }

    for (const c of corners) {
      if ((c.x === from.x || c.y === from.y) && (c.x === to.x || c.y === to.y)) {
        Painter.drawLine(level, from, c, floor);
        Painter.drawLine(level, c, to, floor);
        return;
      }
    }

    let side: Point;
    if (from.y === r.top + 1 || from.y === r.bottom - 1) {
      if (PerimeterRoom.spaceBetween(r.left, from.x) + PerimeterRoom.spaceBetween(r.left, to.x) <=
        PerimeterRoom.spaceBetween(r.right, from.x) + PerimeterRoom.spaceBetween(r.right, to.x)) {
        side = { x: r.left + 1, y: r.top + Math.floor(r.height() / 2) };
      } else {
        side = { x: r.right - 1, y: r.top + Math.floor(r.height() / 2) };
      }
    } else {
      if (PerimeterRoom.spaceBetween(r.top, from.y) + PerimeterRoom.spaceBetween(r.top, to.y) <=
        PerimeterRoom.spaceBetween(r.bottom, from.y) + PerimeterRoom.spaceBetween(r.bottom, to.y)) {
        side = { x: r.left + Math.floor(r.width() / 2), y: r.top + 1 };
      } else {
        side = { x: r.left + Math.floor(r.width() / 2), y: r.bottom - 1 };
      }
    }
    PerimeterRoom.fillBetweenPoints(level, r, from, side, floor);
    PerimeterRoom.fillBetweenPoints(level, r, side, to, floor);
  }
}

let corners: Point[] | null = null;
