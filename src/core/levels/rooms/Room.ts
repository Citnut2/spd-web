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

import { Point, Rect, rectWidth, rectHeight } from '../../utils/Geom';
import { Int as RandInt, NormalIntRange, IntRange } from '../../utils/Random';
import { Level } from '../Level';

export enum DoorType {
  EMPTY,
  TUNNEL,
  WATER,
  REGULAR,
  UNLOCKED,
  HIDDEN,
  BARRICADE,
  LOCKED,
  CRYSTAL,
  WALL
}

export class Door {
  x: number;
  y: number;
  type: DoorType = DoorType.EMPTY;
  private typeLocked = false;

  constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
  }

  lockTypeChanges(lock: boolean): void {
    this.typeLocked = lock;
  }

  set(type: DoorType): void {
    if (!this.typeLocked && type > this.type) {
      this.type = type;
    }
  }
}

function getRectPoints(r: Rect): Point[] {
  const points: Point[] = [];
  for (let i = r.left; i <= r.right; i++) {
    for (let j = r.top; j <= r.bottom; j++) {
      points.push({ x: i, y: j });
    }
  }
  return points;
}

export abstract class Room {
  neighbours: Room[] = [];
  connected: Map<Room, Door> = new Map();

  left = 0;
  top = 0;
  right = 0;
  bottom = 0;

  distance = 0;
  price = 1;

  set(other: Room): this {
    this.left = other.left;
    this.top = other.top;
    this.right = other.right;
    this.bottom = other.bottom;
    for (const r of other.neighbours) {
      this.neighbours.push(r);
      const idx = r.neighbours.indexOf(other);
      if (idx >= 0) r.neighbours.splice(idx, 1);
      r.neighbours.push(this);
    }
    for (const [r, d] of other.connected) {
      r.connected.delete(other);
      r.connected.set(this, d);
      this.connected.set(r, d);
    }
    return this;
  }

  // **** Spatial logic ****

  minWidth(): number { return -1; }
  maxWidth(): number { return -1; }
  minHeight(): number { return -1; }
  maxHeight(): number { return -1; }

  setSize(): boolean {
    return this.setSizeInternal(this.minWidth(), this.maxWidth(), this.minHeight(), this.maxHeight());
  }

  forceSize(w: number, h: number): boolean {
    return this.setSizeInternal(w, w, h, h);
  }

  setSizeWithLimit(w: number, h: number): boolean {
    if (w < this.minWidth() || h < this.minHeight()) {
      return false;
    } else {
      this.setSize();
      if (this.width() > w || this.height() > h) {
        this.resize(Math.min(this.width(), w) - 1, Math.min(this.height(), h) - 1);
      }
      return true;
    }
  }

  protected setSizeInternal(minW: number, maxW: number, minH: number, maxH: number): boolean {
    if (minW < this.minWidth()
      || maxW > this.maxWidth()
      || minH < this.minHeight()
      || maxH > this.maxHeight()
      || minW > maxW
      || minH > maxH) {
      return false;
    } else {
      this.resize(NormalIntRange(minW, maxW) - 1, NormalIntRange(minH, maxH) - 1);
      return true;
    }
  }

  pointInside(from: Point, n: number): Point {
    const step: Point = { x: from.x, y: from.y };
    if (from.x === this.left) {
      step.x += n;
    } else if (from.x === this.right) {
      step.x -= n;
    } else if (from.y === this.top) {
      step.y += n;
    } else if (from.y === this.bottom) {
      step.y -= n;
    }
    return step;
  }

  width(): number {
    return this.right - this.left + 1;
  }

  height(): number {
    return this.bottom - this.top + 1;
  }

  random(): Point;
  random(m: number): Point;
  random(m?: number): Point {
    const margin = m ?? 1;
    return {
      x: IntRange(this.left + margin, this.right - margin),
      y: IntRange(this.top + margin, this.bottom - margin)
    };
  }

  inside(p: Point): boolean {
    return p.x > this.left && p.y > this.top && p.x < this.right && p.y < this.bottom;
  }

  center(): Point {
    return {
      x: Math.floor((this.left + this.right) / 2) + (((this.right - this.left) % 2) === 1 ? RandInt(2) : 0),
      y: Math.floor((this.top + this.bottom) / 2) + (((this.bottom - this.top) % 2) === 1 ? RandInt(2) : 0)
    };
  }

  // **** Connection logic ****

  static readonly ALL = 0;
  static readonly LEFT = 1;
  static readonly TOP = 2;
  static readonly RIGHT = 3;
  static readonly BOTTOM = 4;

  minConnections(direction: number): number {
    if (direction === Room.ALL) return 1;
    return 0;
  }

  curConnections(direction: number): number {
    if (direction === Room.ALL) {
      return this.connected.size;
    } else {
      let total = 0;
      for (const [r] of this.connected) {
        const i = this.intersect(r);
        if (direction === Room.LEFT && rectWidth(i) === 0 && i.left === this.left) total++;
        else if (direction === Room.TOP && rectHeight(i) === 0 && i.top === this.top) total++;
        else if (direction === Room.RIGHT && rectWidth(i) === 0 && i.right === this.right) total++;
        else if (direction === Room.BOTTOM && rectHeight(i) === 0 && i.bottom === this.bottom) total++;
      }
      return total;
    }
  }

  remConnections(direction: number): number {
    if (this.curConnections(Room.ALL) >= this.maxConnections(Room.ALL)) return 0;
    return this.maxConnections(direction) - this.curConnections(direction);
  }

  maxConnections(direction: number): number {
    if (direction === Room.ALL) return 16;
    return 4;
  }

  canConnect(p: Point): boolean;
  canConnect(direction: number): boolean;
  canConnect(r: Room): boolean;
  canConnect(arg: Point | number | Room): boolean {
    if (typeof arg === 'number') {
      return this.remConnections(arg) > 0;
    }
    if ('left' in arg) {
      const r = arg as Room;
      if ((this.isExit() && r.isEntrance()) || (this.isEntrance() && r.isExit())) {
        return false;
      }

      const i = this.intersect(r);

      let foundPoint = false;
      for (const p of getRectPoints(i)) {
        if (this.canConnect(p) && r.canConnect(p)) {
          foundPoint = true;
          break;
        }
      }
      if (!foundPoint) return false;

      if (rectWidth(i) === 0 && i.left === this.left) {
        return this.canConnect(Room.LEFT) && r.canConnect(Room.RIGHT);
      } else if (rectHeight(i) === 0 && i.top === this.top) {
        return this.canConnect(Room.TOP) && r.canConnect(Room.BOTTOM);
      } else if (rectWidth(i) === 0 && i.right === this.right) {
        return this.canConnect(Room.RIGHT) && r.canConnect(Room.LEFT);
      } else if (rectHeight(i) === 0 && i.bottom === this.bottom) {
        return this.canConnect(Room.BOTTOM) && r.canConnect(Room.TOP);
      } else {
        return false;
      }
    }
    const p = arg as Point;
    return (p.x === this.left || p.x === this.right) !== (p.y === this.top || p.y === this.bottom);
  }

  canMerge(_l: Level, _other: Room, _p: Point, _mergeTerrain: number): boolean {
    return false;
  }

  merge(_l: Level, _other: Room, _merge: Rect, _mergeTerrain: number): void {
  }

  addNeighbour(other: Room): boolean {
    if (this.neighbours.includes(other)) return true;

    const i = this.intersect(other);
    if ((rectWidth(i) === 0 && rectHeight(i) >= 2) ||
      (rectHeight(i) === 0 && rectWidth(i) >= 2)) {
      this.neighbours.push(other);
      other.neighbours.push(this);
      return true;
    }
    return false;
  }

  connect(room: Room): boolean {
    if ((this.neighbours.includes(room) || this.addNeighbour(room))
      && !this.connected.has(room) && this.canConnect(room)) {
      this.connected.set(room, new Door());
      room.connected.set(this, new Door());
      return true;
    }
    return false;
  }

  clearConnections(): void {
    for (const r of this.neighbours) {
      const idx = r.neighbours.indexOf(this);
      if (idx >= 0) r.neighbours.splice(idx, 1);
    }
    this.neighbours = [];
    for (const r of this.connected.keys()) {
      r.connected.delete(this);
    }
    this.connected.clear();
  }

  isEntrance(): boolean {
    return false;
  }

  isExit(): boolean {
    return false;
  }

  // **** Painter Logic ****

  abstract paint(level: Level): void;

  canPlaceWater(_p: Point): boolean {
    return true;
  }

  waterPlaceablePoints(): Point[] {
    const points: Point[] = [];
    for (let i = this.left; i <= this.right; i++) {
      for (let j = this.top; j <= this.bottom; j++) {
        const p: Point = { x: i, y: j };
        if (this.canPlaceWater(p)) points.push(p);
      }
    }
    return points;
  }

  canPlaceGrass(_p: Point): boolean {
    return true;
  }

  grassPlaceablePoints(): Point[] {
    const points: Point[] = [];
    for (let i = this.left; i <= this.right; i++) {
      for (let j = this.top; j <= this.bottom; j++) {
        const p: Point = { x: i, y: j };
        if (this.canPlaceGrass(p)) points.push(p);
      }
    }
    return points;
  }

  canPlaceTrap(_p: Point): boolean {
    return true;
  }

  trapPlaceablePoints(): Point[] {
    const points: Point[] = [];
    for (let i = this.left; i <= this.right; i++) {
      for (let j = this.top; j <= this.bottom; j++) {
        const p: Point = { x: i, y: j };
        if (this.canPlaceTrap(p)) points.push(p);
      }
    }
    return points;
  }

  canPlaceItem(p: Point, _l: Level): boolean {
    return this.inside(p);
  }

  itemPlaceablePoints(l: Level): Point[] {
    const points: Point[] = [];
    for (let i = this.left; i <= this.right; i++) {
      for (let j = this.top; j <= this.bottom; j++) {
        const p: Point = { x: i, y: j };
        if (this.canPlaceItem(p, l)) points.push(p);
      }
    }
    return points;
  }

  canPlaceCharacter(p: Point, _l: Level): boolean {
    return this.inside(p);
  }

  charPlaceablePoints(l: Level): Point[] {
    const points: Point[] = [];
    for (let i = this.left; i <= this.right; i++) {
      for (let j = this.top; j <= this.bottom; j++) {
        const p: Point = { x: i, y: j };
        if (this.canPlaceCharacter(p, l)) points.push(p);
      }
    }
    return points;
  }

  // **** Graph Node interface ****

  distanceVal(): number {
    return this.distance;
  }

  setDistance(value: number): void {
    this.distance = value;
  }

  priceVal(): number {
    return this.price;
  }

  setPrice(value: number): void {
    this.price = value;
  }

  edges(): Room[] {
    const result: Room[] = [];
    for (const [r, d] of this.connected) {
      if (d.type === DoorType.EMPTY || d.type === DoorType.TUNNEL
        || d.type === DoorType.UNLOCKED || d.type === DoorType.REGULAR) {
        result.push(r);
      }
    }
    return result;
  }

  intersect(other: Room): Rect {
    return {
      left: Math.max(this.left, other.left),
      top: Math.max(this.top, other.top),
      right: Math.min(this.right, other.right),
      bottom: Math.min(this.bottom, other.bottom)
    };
  }

  private _empty = true;

  isEmpty(): boolean {
    return this._empty;
  }

  setEmpty(): void {
    this._empty = true;
  }

  shift(dx: number, dy: number): void {
    this.left += dx;
    this.top += dy;
    this.right += dx;
    this.bottom += dy;
  }

  private resize(w: number, h: number): void {
    this.right = this.left + w;
    this.bottom = this.top + h;
  }

  setPos(x: number, y: number): void {
    const w = this.width();
    const h = this.height();
    this.left = x;
    this.top = y;
    this.right = x + w - 1;
    this.bottom = y + h - 1;
  }
}
