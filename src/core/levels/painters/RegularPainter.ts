// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.painters.RegularPainter

import { Painter } from './Painter';
import { Level } from '../Level';
import { Room, DoorType } from '../rooms/Room';
import { Patch } from '../Patch';
import { Point } from '../../utils/Geom';
import * as Random from '../../utils/Random';
import { Terrain, flags } from '../Terrain';
import { Dungeon } from '../Dungeon';
import { ConnectionRoom } from '../rooms/connection/ConnectionRoom';
import { StandardRoom, SizeCategory } from '../rooms/standard/StandardRoom';
import { Graph } from '../../utils/Graph';
import { PathFinder } from '../../utils/PathFinder';

export abstract class RegularPainter extends Painter {

  waterFill = 0;
  waterSmoothness = 0;

  grassFill = 0;
  grassSmoothness = 0;

  nTraps = 0;
  trapClasses: any[] = [];
  trapChances: number[] = [];

  setWater(fill: number, smoothness: number): this {
    this.waterFill = fill;
    this.waterSmoothness = smoothness;
    return this;
  }

  setGrass(fill: number, smoothness: number): this {
    this.grassFill = fill;
    this.grassSmoothness = smoothness;
    return this;
  }

  setTraps(num: number, classes: any[], chances: number[]): this {
    this.nTraps = num;
    this.trapClasses = classes;
    this.trapChances = chances;
    return this;
  }

  override paint(level: Level, rooms: Room[]): boolean {
    if (rooms.length > 0) {
      const padding = this.padding(level);

      let leftMost = Number.MAX_SAFE_INTEGER;
      let topMost = Number.MAX_SAFE_INTEGER;

      for (const r of rooms) {
        if (r.left < leftMost) leftMost = r.left;
        if (r.top < topMost) topMost = r.top;
      }

      leftMost -= padding;
      topMost -= padding;

      let rightMost = 0;
      let bottomMost = 0;

      for (const r of rooms) {
        r.shift(-leftMost, -topMost);
        if (r.right > rightMost) rightMost = r.right;
        if (r.bottom > bottomMost) bottomMost = r.bottom;
      }

      rightMost += padding;
      bottomMost += padding;

      level.setSize(rightMost + 1, bottomMost + 1);
    } else {
      if (level.width === 0) return false;
      rooms = [];
    }

    Random.shuffle(rooms);

    for (const r of [...rooms]) {
      if (r.connected.size === 0) {
        if (r.constructor.name.startsWith('SpecialRoom')) return false;
      }
      this.placeDoors(r);
      r.paint(level);
    }

    this.paintDoors(level, rooms);

    Random.pushGenerator(Random.Long());

    if (this.waterFill > 0) {
      this.paintWater(level, rooms);
    }

    if (this.grassFill > 0) {
      this.paintGrass(level, rooms);
    }

    if (this.nTraps > 0) {
      this.paintTraps(level, rooms);
    }

    this.decorate(level, rooms);

    Random.popGenerator();

    return true;
  }

  private placeDoors(r: Room): void {
    for (const [n, door] of r.connected.entries()) {
      if (door.x !== 0 || door.y !== 0) continue;

      const i = r.intersect(n);
      const doorSpots: Point[] = [];
      for (let x = i.left; x <= i.right; x++) {
        for (let y = i.top; y <= i.bottom; y++) {
          const p: Point = { x, y };
          if (r.canConnect(p) && n.canConnect(p)) {
            doorSpots.push(p);
          }
        }
      }
      if (doorSpots.length === 0) {
        continue;
      }
      const chosen = Random.element(doorSpots);
      door.x = chosen.x;
      door.y = chosen.y;

      const otherDoor = n.connected.get(r);
      if (otherDoor) {
        otherDoor.x = chosen.x;
        otherDoor.y = chosen.y;
      }
    }
  }

  private paintDoors(level: Level, rooms: Room[]): void {
    let hiddenDoorChance = 0;
    if (Dungeon.depth > 1) {
      hiddenDoorChance = Math.min(1, Dungeon.depth / 20);
    }
    if (level.feeling === Level.FEELING_SECRETS) {
      hiddenDoorChance = (0.5 + hiddenDoorChance) / 2;
    }

    const roomMerges = new Map<Room, Room>();

    for (const r of rooms) {
      for (const [n, d] of r.connected.entries()) {
        if (roomMerges.get(r) === n || roomMerges.get(n) === r) {
          continue;
        }
        if (!roomMerges.has(r) && !roomMerges.has(n)
          && this.mergeRooms(level, r, n, d, Terrain.EMPTY)) {
          if ((r as StandardRoom).sizeCat === SizeCategory.NORMAL) roomMerges.set(r, n);
          if ((n as StandardRoom).sizeCat === SizeCategory.NORMAL) roomMerges.set(n, r);
          continue;
        }

        const doorCell = d.y * level.width + d.x;

        if (d.type === DoorType.REGULAR) {
          if (Random.Float() < hiddenDoorChance) {
            d.set(DoorType.HIDDEN);
            if (level.feeling !== Level.FEELING_SECRETS) {
              Graph.buildDistanceMap(rooms, r);
              if (n.distance === Number.MAX_SAFE_INTEGER) {
                d.set(DoorType.UNLOCKED);
              }
            } else {
              let roomsInGraph = 0;
              Graph.buildDistanceMap(rooms, r);
              for (const rDest of rooms) {
                if (rDest.distance !== Number.MAX_SAFE_INTEGER
                  && !(rDest instanceof ConnectionRoom)) {
                  roomsInGraph++;
                }
              }
              if (roomsInGraph < 2) {
                d.set(DoorType.UNLOCKED);
              } else {
                roomsInGraph = 0;
                Graph.buildDistanceMap(rooms, n);
                for (const nDest of rooms) {
                  if (nDest.distance !== Number.MAX_SAFE_INTEGER
                    && !(nDest instanceof ConnectionRoom)) {
                    roomsInGraph++;
                  }
                }
                if (roomsInGraph < 2) {
                  d.set(DoorType.UNLOCKED);
                }
              }
            }
            Graph.buildDistanceMap(rooms, r);
            if (level.feeling !== Level.FEELING_SECRETS && n.distance === Number.MAX_SAFE_INTEGER) {
              d.set(DoorType.UNLOCKED);
            }
          } else {
            d.set(DoorType.UNLOCKED);
          }
        }

        switch (d.type) {
          case DoorType.EMPTY:
            level.map[doorCell] = Terrain.EMPTY;
            break;
          case DoorType.TUNNEL:
            level.map[doorCell] = level.tunnelTile();
            break;
          case DoorType.WATER:
            level.map[doorCell] = Terrain.WATER;
            break;
          case DoorType.UNLOCKED:
            level.map[doorCell] = Terrain.DOOR;
            break;
          case DoorType.HIDDEN:
            level.map[doorCell] = Terrain.SECRET_DOOR;
            break;
          case DoorType.BARRICADE:
            level.map[doorCell] = Terrain.BARRICADE;
            break;
          case DoorType.LOCKED:
            level.map[doorCell] = Terrain.LOCKED_DOOR;
            break;
          case DoorType.CRYSTAL:
            level.map[doorCell] = Terrain.CRYSTAL_DOOR;
            break;
          case DoorType.WALL:
            break;
        }
      }
    }
  }

  protected mergeRooms(l: Level, r: Room, n: Room, start: Point, mergeTerrain: number): boolean {
    const intersect = r.intersect(n);
    if (intersect.left === intersect.right) {
      const merge: { left: number; top: number; right: number; bottom: number } = {
        left: intersect.left,
        top: start != null ? start.y : Math.floor((intersect.top + intersect.bottom) / 2),
        right: intersect.left,
        bottom: start != null ? start.y : Math.floor((intersect.top + intersect.bottom) / 2)
      };

      const p: Point = { x: merge.left, y: merge.top };
      while (merge.top > intersect.top && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.top--;
        p.y--;
      }
      p.y = merge.bottom;
      while (merge.bottom < intersect.bottom && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.bottom++;
        p.y++;
      }

      if (merge.bottom - merge.top >= 3) {
        r.merge(l, n, { left: merge.left, top: merge.top + 1, right: merge.left + 1, bottom: merge.bottom }, mergeTerrain);
        return true;
      }
      return false;
    } else if (intersect.top === intersect.bottom) {
      const merge: { left: number; top: number; right: number; bottom: number } = {
        left: start != null ? start.x : Math.floor((intersect.left + intersect.right) / 2),
        top: intersect.top,
        right: start != null ? start.x : Math.floor((intersect.left + intersect.right) / 2),
        bottom: intersect.top
      };

      const p: Point = { x: merge.left, y: merge.top };
      while (merge.left > intersect.left && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.left--;
        p.x--;
      }
      p.x = merge.right;
      while (merge.right < intersect.right && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.right++;
        p.x++;
      }

      if (merge.right - merge.left >= 3) {
        r.merge(l, n, { left: merge.left + 1, top: merge.top, right: merge.right, bottom: merge.top + 1 }, mergeTerrain);
        return true;
      }
      return false;
    }
    return false;
  }

  private paintWater(level: Level, rooms: Room[]): void {
    const water = Patch.generate(
      level.width, level.height, this.waterFill, this.waterSmoothness, true
    );

    for (const r of rooms) {
      if (!(r instanceof StandardRoom)) continue;
      for (const p of r.waterPlaceablePoints()) {
        const cell = p.y * level.width + p.x;
        if (water[cell] && level.map[cell] === Terrain.EMPTY) {
          level.map[cell] = Terrain.WATER;
        }
      }
    }
  }

  private paintGrass(level: Level, rooms: Room[]): void {
    const grass = Patch.generate(
      level.width, level.height, this.grassFill, this.grassSmoothness, true
    );

    const grassCells: number[] = [];

    for (const r of rooms) {
      if (!(r instanceof StandardRoom)) continue;
      for (const p of r.grassPlaceablePoints()) {
        const cell = p.y * level.width + p.x;
        if (grass[cell] && level.map[cell] === Terrain.EMPTY) {
          grassCells.push(cell);
        }
      }
    }

    for (const cell of grassCells) {
      if (level.heaps.get(cell) != null || level.findMob(cell) != null) {
        level.map[cell] = Terrain.GRASS;
        continue;
      }

      let count = 1;
      for (const n of PathFinder.NEIGHBOURS8) {
        const nCell = cell + n;
        if (nCell >= 0 && nCell < grass.length && grass[nCell]) {
          count++;
        }
      }
      level.map[cell] = Random.Float() < count / 12 ? Terrain.HIGH_GRASS : Terrain.GRASS;
    }
  }

  private paintTraps(level: Level, rooms: Room[]): void {
    const validCells: number[] = [];

    for (const r of rooms) {
      for (const p of r.trapPlaceablePoints()) {
        const cell = p.y * level.width + p.x;
        if (level.map[cell] === Terrain.EMPTY) {
          validCells.push(cell);
        }
      }
    }

    this.nTraps = Math.min(this.nTraps, Math.floor(validCells.length / 5));

    const validNonHallways: number[] = [];

    for (let i = 0; i < level.map.length; i++) {
      level.passable[i] = (flags[level.map[i]!]! & Terrain.PASSABLE) !== 0;
    }

    for (const cell of validCells) {
      const n3 = cell + PathFinder.CIRCLE4[3]!;
      const n1 = cell + PathFinder.CIRCLE4[1]!;
      const n0 = cell + PathFinder.CIRCLE4[0]!;
      const n2 = cell + PathFinder.CIRCLE4[2]!;
      if ((level.passable[n0] ?? false) || (level.passable[n2] ?? false)
        && (level.passable[n1] ?? false) || (level.passable[n3] ?? false)) {
        validNonHallways.push(cell);
      }
    }

    this.nTraps = Math.min(this.nTraps, Math.floor(validCells.length / 5));

    for (let i = 0; i < this.nTraps; i++) {
      const trapPos = Random.element(validCells);
      const idx = validCells.indexOf(trapPos);
      if (idx >= 0) validCells.splice(idx, 1);
      const nhIdx = validNonHallways.indexOf(trapPos);
      if (nhIdx >= 0) validNonHallways.splice(nhIdx, 1);

      if (Dungeon.depth <= 1 || Random.Float() < 0.4) {
        level.map[trapPos] = Terrain.SECRET_TRAP;
      } else {
        level.map[trapPos] = Terrain.TRAP;
      }
    }
  }

  protected abstract decorate(level: Level, rooms: Room[]): void;

  protected padding(level: Level): number {
    if (level.feeling === Level.FEELING_CHASM) {
      return 2;
    }
    return 1;
  }
}
