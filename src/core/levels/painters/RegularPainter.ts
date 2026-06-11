/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2025 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

import { Painter } from './Painter';
import { Level } from '../Level';
import { Room, DoorType } from '../rooms/Room';
import { Patch } from '../Patch';
import { Point, Rect, rectWidth, rectHeight } from '../../utils/Geom';
import * as Random from '../../utils/Random';
import { Terrain } from '../Terrain';
import { Dungeon } from '../Dungeon';
import { ConnectionRoom } from '../rooms/connection/ConnectionRoom';
import { StandardRoom } from '../rooms/standard/StandardRoom';

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
      const first = rooms[0]!;
      let leftMost = first.left;
      let rightMost = first.right;
      let topMost = first.top;
      let bottomMost = first.bottom;

      for (const r of rooms) {
        if (r.left < leftMost) leftMost = r.left;
        if (r.right > rightMost) rightMost = r.right;
        if (r.top < topMost) topMost = r.top;
        if (r.bottom > bottomMost) bottomMost = r.bottom;
      }

      for (const r of rooms) {
        r.setPos(r.left - leftMost, r.top - topMost);
      }

      level.setSize(rightMost + 1, bottomMost + 1);
    }

    Random.shuffle(rooms);

    for (const r of rooms) {
      if (r.connected.size > 0) {
        this.placeDoors(r);
        r.paint(level);
      }
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
    for (const [n, door] of r.connected) {
      const i = this.roomIntersect(r, n);
      const validDoors: Point[] = [];

      if (rectWidth(i) === 0) {
        for (let y = i.top; y <= i.bottom; y++) {
          validDoors.push({ x: i.left, y });
        }
      } else if (rectHeight(i) === 0) {
        for (let x = i.left; x <= i.right; x++) {
          validDoors.push({ x, y: i.top });
        }
      }

      if (validDoors.length > 0) {
        const chosen = Random.element(validDoors);
        door.x = chosen.x;
        door.y = chosen.y;
      }
    }
  }

  private paintDoors(level: Level, rooms: Room[]): void {
    for (const r of rooms) {
      for (const [n, door] of r.connected) {
        const doorCell = door.y * level.width + door.x;
        const doorTerrain = level.map[doorCell]!;

        if (doorTerrain === Terrain.WATER) {
          door.set(DoorType.WATER);
        }

        if (door.type === DoorType.EMPTY) {
          const nIsConn = n instanceof ConnectionRoom;
          const rIsConn = r instanceof ConnectionRoom;

          if (rIsConn && nIsConn) {
            door.set(DoorType.TUNNEL);
          } else if (rIsConn || nIsConn) {
            const standard = rIsConn ? n : r;
            if (standard.width() > 7 || standard.height() > 7) {
              door.set(DoorType.TUNNEL);
            }
          } else {
            door.set(DoorType.REGULAR);
          }
        }

        if (r.isEntrance() || n.isEntrance() ||
            r.isExit() || n.isExit()) {
          door.set(DoorType.EMPTY);
        }

        if (door.type === DoorType.REGULAR) {
          if (Dungeon.depth <= 1) {
            if (Random.Float() < 0.1 * Dungeon.depth) {
              door.set(DoorType.HIDDEN);
            }
          } else if (Random.Float() < 0.15 + 0.05 * (Dungeon.depth - 2)) {
            door.set(DoorType.HIDDEN);
          }
          if (r instanceof ConnectionRoom || n instanceof ConnectionRoom) {
            door.set(DoorType.EMPTY);
          }
        }

        switch (door.type) {
          case DoorType.EMPTY:
            level.map[doorCell] = Terrain.EMPTY;
            break;
          case DoorType.TUNNEL:
            level.map[doorCell] = Terrain.EMPTY;
            break;
          case DoorType.WATER:
            level.map[doorCell] = Terrain.WATER;
            break;
          case DoorType.REGULAR:
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

    for (const r of rooms) {
      if (!(r instanceof StandardRoom)) continue;
      for (const p of r.grassPlaceablePoints()) {
        const cell = p.y * level.width + p.x;
        if (grass[cell] && level.map[cell] === Terrain.EMPTY) {
          level.map[cell] = Terrain.GRASS;
        }
      }
    }

    if (this.grassFill > 0) {
      for (const r of rooms) {
        if (!(r instanceof StandardRoom)) continue;
        for (const p of r.grassPlaceablePoints()) {
          const cell = p.y * level.width + p.x;
          if (level.map[cell] === Terrain.EMPTY) {
            const neighbours = level.getNeighbours4(cell);
            let neighbourCount = 0;
            for (const n of neighbours) {
              if (level.map[n] === Terrain.GRASS || level.map[n] === Terrain.HIGH_GRASS) {
                neighbourCount++;
              }
            }
            if (neighbourCount >= 3 && Random.Float() < 0.2 * neighbourCount) {
              level.map[cell] = Terrain.HIGH_GRASS;
            }
          }
        }
      }
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

    const hallways = new Set<number>();
    for (const r of rooms) {
      for (const [_n, door] of r.connected) {
        const dc = door.y * level.width + door.x;
        for (const n of level.getNeighbours4(dc)) {
          hallways.add(n);
        }
      }
    }

    const filtered = validCells.filter(c => !hallways.has(c));
    Random.shuffle(filtered);

    const count = Math.min(this.nTraps, filtered.length);
    for (let i = 0; i < count; i++) {
      const cell = filtered[i]!;
      level.map[cell] = Terrain.TRAP;
      if (Dungeon.depth <= 1 || Random.Float() < 0.4) {
        level.map[cell] = Terrain.SECRET_TRAP;
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

  private roomIntersect(a: Room, b: Room): Rect {
    return {
      left: Math.max(a.left, b.left),
      top: Math.max(a.top, b.top),
      right: Math.min(a.right, b.right),
      bottom: Math.min(a.bottom, b.bottom)
    };
  }
}
