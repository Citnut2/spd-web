// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder

import { Room } from '../rooms/Room';
import { Point, PointF, Rect, rect, gate, rectWidth, rectHeight } from '../../utils/Geom';
import * as Random from '../../utils/Random';

const A = 180 / Math.PI;

export abstract class Builder {
  abstract build(rooms: Room[]): Room[] | null;

  static findNeighbours(rooms: Room[]): void {
    for (let i = 0; i < rooms.length - 1; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        rooms[i]!.addNeighbour(rooms[j]!);
      }
    }
  }

  static findFreeSpace(start: Point, collision: Room[], maxSize: number): Rect {
    const space = rect(start.x - maxSize, start.y - maxSize, start.x + maxSize, start.y + maxSize);
    const colliding: Room[] = [...collision];

    do {
      for (let i = colliding.length - 1; i >= 0; i--) {
        const room = colliding[i]!;
        if (
          room.isEmpty() ||
          Math.max(space.left, room.left) >= Math.min(space.right, room.right) ||
          Math.max(space.top, room.top) >= Math.min(space.bottom, room.bottom)
        ) {
          colliding.splice(i, 1);
        }
      }

      if (colliding.length === 0) break;

      let closestRoom: Room | null = null;
      let closestDiff = Number.MAX_SAFE_INTEGER;
      let inside = true;
      let curDiff = 0;

      for (const curRoom of colliding) {
        inside = true;
        curDiff = 0;

        if (start.x <= curRoom.left) {
          inside = false;
          curDiff += curRoom.left - start.x;
        } else if (start.x >= curRoom.right) {
          inside = false;
          curDiff += start.x - curRoom.right;
        }

        if (start.y <= curRoom.top) {
          inside = false;
          curDiff += curRoom.top - start.y;
        } else if (start.y >= curRoom.bottom) {
          inside = false;
          curDiff += start.y - curRoom.bottom;
        }

        if (inside) {
          space.left = start.x;
          space.top = start.y;
          space.right = start.x;
          space.bottom = start.y;
          return space;
        }

        if (curDiff < closestDiff) {
          closestDiff = curDiff;
          closestRoom = curRoom;
        }
      }

      if (closestRoom !== null) {
        const wDiff = (() => {
          if (closestRoom.left >= start.x) {
            return (space.right - closestRoom.left) * (rectHeight(space) + 1);
          }
          if (closestRoom.right <= start.x) {
            return (closestRoom.right - space.left) * (rectHeight(space) + 1);
          }
          return Number.MAX_SAFE_INTEGER;
        })();

        const hDiff = (() => {
          if (closestRoom.top >= start.y) {
            return (space.bottom - closestRoom.top) * (rectWidth(space) + 1);
          }
          if (closestRoom.bottom <= start.y) {
            return (closestRoom.bottom - space.top) * (rectWidth(space) + 1);
          }
          return Number.MAX_SAFE_INTEGER;
        })();

        if (wDiff < hDiff || (wDiff === hDiff && Random.Int(2) === 0)) {
          if (closestRoom.left >= start.x && closestRoom.left < space.right) space.right = closestRoom.left;
          if (closestRoom.right <= start.x && closestRoom.right > space.left) space.left = closestRoom.right;
        } else {
          if (closestRoom.top >= start.y && closestRoom.top < space.bottom) space.bottom = closestRoom.top;
          if (closestRoom.bottom <= start.y && closestRoom.bottom > space.top) space.top = closestRoom.bottom;
        }

        const idx = colliding.indexOf(closestRoom);
        if (idx !== -1) colliding.splice(idx, 1);
      }
    } while (colliding.length > 0);

    return space;
  }

  static angleBetweenRooms(from: Room, to: Room): number {
    const fromCenter: PointF = {
      x: (from.left + from.right) / 2,
      y: (from.top + from.bottom) / 2,
    };
    const toCenter: PointF = {
      x: (to.left + to.right) / 2,
      y: (to.top + to.bottom) / 2,
    };
    return Builder.angleBetweenPoints(fromCenter, toCenter);
  }

  static angleBetweenPoints(from: PointF, to: PointF): number {
    const m = (to.y - from.y) / (to.x - from.x);
    let angle = A * (Math.atan(m) + Math.PI / 2);
    if (from.x > to.x) angle -= 180;
    return angle;
  }

  static placeRoom(collision: Room[], prev: Room, next: Room, angle: number): number {
    angle %= 360;
    if (angle < 0) {
      angle += 360;
    }

    const prevCenter: PointF = {
      x: (prev.left + prev.right) / 2,
      y: (prev.top + prev.bottom) / 2,
    };

    const m = Math.tan(angle / A + Math.PI / 2);
    const b = prevCenter.y - m * prevCenter.x;

    let start: Point;
    let direction: number;

    if (Math.abs(m) >= 1) {
      if (angle < 90 || angle > 270) {
        direction = Room.TOP;
        start = { x: Math.round((prev.top - b) / m), y: prev.top };
      } else {
        direction = Room.BOTTOM;
        start = { x: Math.round((prev.bottom - b) / m), y: prev.bottom };
      }
    } else {
      if (angle < 180) {
        direction = Room.RIGHT;
        start = { x: prev.right, y: Math.round(m * prev.right + b) };
      } else {
        direction = Room.LEFT;
        start = { x: prev.left, y: Math.round(m * prev.left + b) };
      }
    }

    if (direction === Room.TOP || direction === Room.BOTTOM) {
      start.x = gate(prev.left + 1, start.x, prev.right - 1);
    } else {
      start.y = gate(prev.top + 1, start.y, prev.bottom - 1);
    }

    const space = Builder.findFreeSpace(start, collision, Math.max(next.maxWidth(), next.maxHeight()));
    if (!next.setSizeWithLimit(space.right - space.left + 1, space.bottom - space.top + 1)) {
      return -1;
    }

    const targetCenter: PointF = { x: 0, y: 0 };

    if (direction === Room.TOP) {
      targetCenter.y = prev.top - (next.height() - 1) / 2;
      targetCenter.x = (targetCenter.y - b) / m;
      next.setPos(
        Math.round(targetCenter.x - (next.width() - 1) / 2),
        prev.top - (next.height() - 1)
      );
    } else if (direction === Room.BOTTOM) {
      targetCenter.y = prev.bottom + (next.height() - 1) / 2;
      targetCenter.x = (targetCenter.y - b) / m;
      next.setPos(
        Math.round(targetCenter.x - (next.width() - 1) / 2),
        prev.bottom
      );
    } else if (direction === Room.RIGHT) {
      targetCenter.x = prev.right + (next.width() - 1) / 2;
      targetCenter.y = m * targetCenter.x + b;
      next.setPos(
        prev.right,
        Math.round(targetCenter.y - (next.height() - 1) / 2)
      );
    } else {
      targetCenter.x = prev.left - (next.width() - 1) / 2;
      targetCenter.y = m * targetCenter.x + b;
      next.setPos(
        prev.left - (next.width() - 1),
        Math.round(targetCenter.y - (next.height() - 1) / 2)
      );
    }

    if (direction === Room.TOP || direction === Room.BOTTOM) {
      if (next.right < prev.left + 2) next.shift(prev.left + 2 - next.right, 0);
      else if (next.left > prev.right - 2) next.shift(prev.right - 2 - next.left, 0);

      if (next.right > space.right) next.shift(space.right - next.right, 0);
      else if (next.left < space.left) next.shift(space.left - next.left, 0);
    } else {
      if (next.bottom < prev.top + 2) next.shift(0, prev.top + 2 - next.bottom);
      else if (next.top > prev.bottom - 2) next.shift(0, prev.bottom - 2 - next.top);

      if (next.bottom > space.bottom) next.shift(0, space.bottom - next.bottom);
      else if (next.top < space.top) next.shift(0, space.top - next.top);
    }

    if (next.connect(prev)) {
      return Builder.angleBetweenRooms(prev, next);
    }
    return -1;
  }
}
