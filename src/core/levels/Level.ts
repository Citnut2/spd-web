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

import { Terrain, isPassable, isSolid, isLosBlocking, isAvoid } from './Terrain';
import { Actor } from '../actors/Actor';
import { Char } from '../actors/Char';
import { Room } from './rooms/Room';
import { Point, cellToPoint as geomCellToPoint, pointToCell as geomPointToCell } from '../utils/Geom';
import { element } from '../utils/Random';
import { Heap, setRemoveHeap } from '../items/Heap';
import type { Item } from '../items/Item';

export abstract class Level {
  // Feeling constants
  static readonly FEELING_NONE = 0;
  static readonly FEELING_CHASM = 1;
  static readonly FEELING_LARGE = 2;
  static readonly FEELING_GRASS = 3;
  static readonly FEELING_DARK = 4;
  static readonly FEELING_WATER = 5;
  static readonly FEELING_SECRETS = 6;
  static readonly FEELING_TRAPS = 7;

  width = 38;
  height = 38;
  length = 38 * 38;

  map: number[] = [];
  passable: boolean[] = [];
  solid: boolean[] = [];
  losBlocking: boolean[] = [];
  avoid: boolean[] = [];
  heroFOV: boolean[] = [];
  water: boolean[] = [];
  flamable: boolean[] = [];
  visited: boolean[] = [];
  mapped: boolean[] = [];
  discoverable: boolean[] = [];

  entrance = 0;
  exit = 0;

  mobs: Actor[] = [];

  // Level generation fields
  feeling = Level.FEELING_NONE;
  heaps: Map<number, Heap> = new Map();
  itemsToSpawn: any[] = [];
  color1 = 0;
  color2 = 0;
  openSpace: boolean[] = [];

  constructor() {
    this.map = new Array(this.length).fill(Terrain.WALL);
  }

  abstract createMobs(): void;
  abstract createItems(): void;
  abstract build(): boolean;
  abstract createMob(): Char | null;

  occupyCell(_ch: Char): void {
  }

  drop(item: Item, cell: number): Heap {
    let heap = this.heaps.get(cell);
    if (heap === undefined) {
      heap = new Heap();
      heap.pos = cell;
      this.heaps.set(cell, heap);
    }
    heap.drop(item);
    return heap;
  }

  create(): void {
    setRemoveHeap((pos: number) => {
      this.heaps.delete(pos);
    });

    this.build();
    this.cleanWalls();
    this.updateFlags();
    this.createMobs();
    this.createItems();
  }

  reset(): void {
    this.mobs = [];
    this.build();
    this.cleanWalls();
    this.updateFlags();
  }

  setSize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.length = w * h;
    this.map = new Array(this.length).fill(Terrain.WALL);
    this.passable = new Array(this.length).fill(false);
    this.solid = new Array(this.length).fill(false);
    this.losBlocking = new Array(this.length).fill(false);
    this.avoid = new Array(this.length).fill(false);
    this.heroFOV = new Array(this.length).fill(false);
    this.visited = new Array(this.length).fill(false);
    this.mapped = new Array(this.length).fill(false);
    this.discoverable = new Array(this.length).fill(true);
    this.openSpace = new Array(this.length).fill(true);
  }

  cleanWalls(): void {
    for (let i = 0; i < this.length; i++) {
      if (this.map[i] === Terrain.WALL && this.canBeEmpty(i)) {
        this.map[i] = Terrain.EMPTY;
      }
    }
  }

  private canBeEmpty(cell: number): boolean {
    for (const n of this.getNeighbours4(cell)) {
      const t = this.map[n]!;
      if (t === Terrain.EMPTY || t === Terrain.ENTRANCE || t === Terrain.EXIT) {
        return true;
      }
    }
    return false;
  }

  updateFlags(): void {
    this.passable = this.map.map(t => isPassable(t));
    this.solid = this.map.map(t => isSolid(t));
    this.losBlocking = this.map.map(t => isLosBlocking(t));
    this.avoid = this.map.map(t => isAvoid(t));
    this.heroFOV = new Array(this.length).fill(false);
    this.visited = new Array(this.length).fill(false);
    this.mapped = new Array(this.length).fill(false);
    this.discoverable = new Array(this.length).fill(true);
  }

  buildFlagMaps(): void {
    this.updateFlags();
  }

  updateFieldOfView(): void {
    for (let i = 0; i < this.length; i++) {
      this.heroFOV[i] = !this.solid[i];
    }
  }

  getNeighbours4(cell: number): number[] {
    const result: number[] = [];
    const x = cell % this.width;
    const y = Math.floor(cell / this.width);
    if (x > 0) result.push(cell - 1);
    if (x < this.width - 1) result.push(cell + 1);
    if (y > 0) result.push(cell - this.width);
    if (y < this.height - 1) result.push(cell + this.width);
    return result;
  }

  getNeighbours8(cell: number): number[] {
    const result: number[] = [];
    const x = cell % this.width;
    const y = Math.floor(cell / this.width);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          result.push(ny * this.width + nx);
        }
      }
    }
    return result;
  }

  insideMap(cell: number): boolean {
    return cell >= 0 && cell < this.length;
  }

  getRandomEmptyCell(): number {
    const empties: number[] = [];
    for (let i = 0; i < this.length; i++) {
      if (this.passable[i]) empties.push(i);
    }
    if (empties.length === 0) return this.entrance;
    return element(empties);
  }

  pointToCell(p: Point): number;
  pointToCell(x: number, y: number): number;
  pointToCell(a: Point | number, b?: number): number {
    if (typeof a === 'object') {
      return geomPointToCell(a, this.width);
    }
    return b! * this.width + a;
  }

  cellToPoint(cell: number): Point {
    return geomCellToPoint(cell, this.width);
  }

  findMob(pos: number): Char | null {
    for (const m of this.mobs) {
      if (m instanceof Char && m.pos === pos) return m;
    }
    return null;
  }

  setTrap(_trap: any, _pos: number): void {
    // stub: trap system not yet ported
  }

  tunnelTile(): number {
    return this.feeling === Level.FEELING_CHASM ? Terrain.EMPTY_SP : Terrain.EMPTY;
  }

  rooms: Room[] = [];

  room(_pos: number): Room | null {
    return null;
  }

  randomRespawnCell(_ch: any): number {
    return this.entrance;
  }

  mobLimit(): number {
    // default mob limit, subclasses may override
    return 10;
  }

  randomDropCell(): number {
    return this.getRandomEmptyCell();
  }

  tilesTex(): string | undefined {
    return undefined;
  }

  waterTex(): string | undefined {
    return undefined;
  }
}
