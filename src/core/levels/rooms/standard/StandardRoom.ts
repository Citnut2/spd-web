// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom

import { Room } from '../Room';
import * as Random from '../../../utils/Random';
import { Point } from '../../../utils/Geom';
import { Level } from '../../Level';
import { Terrain, flags } from '../../Terrain';

export enum SizeCategory {
  NORMAL = 0,
  LARGE = 1,
  GIANT = 2,
}

export const SizeCategoryData: {
  minDim: number;
  maxDim: number;
  roomValue: number;
}[] = [
  { minDim: 4, maxDim: 10, roomValue: 1 },
  { minDim: 10, maxDim: 14, roomValue: 2 },
  { minDim: 14, maxDim: 18, roomValue: 3 },
];

export abstract class StandardRoom extends Room {
  sizeCat: SizeCategory = SizeCategory.NORMAL;

  constructor() {
    super();
    this.setSizeCat();
  }

  sizeCatProbs(): number[] {
    return [1, 0, 0];
  }

  setSizeCat(): boolean;
  setSizeCat(maxRoomValue: number): boolean;
  setSizeCat(minOrdinal: number, maxOrdinal: number): boolean;
  setSizeCat(minOrdinal?: number, maxOrdinal?: number): boolean {
    if (minOrdinal === undefined) {
      return this.setSizeCat(0, SizeCategoryData.length - 1);
    }
    if (maxOrdinal === undefined) {
      return this.setSizeCat(0, minOrdinal - 1);
    }
    const probs = this.sizeCatProbs();
    if (probs.length !== SizeCategoryData.length) return false;

    for (let i = 0; i < minOrdinal; i++) probs[i] = 0;
    for (let i = maxOrdinal + 1; i < SizeCategoryData.length; i++) probs[i] = 0;

    const ordinal = Random.chances(probs);
    if (ordinal !== -1) {
      this.sizeCat = ordinal as SizeCategory;
      return true;
    }
    return false;
  }

  override minWidth(): number {
    return SizeCategoryData[this.sizeCat]!.minDim;
  }

  override maxWidth(): number {
    return SizeCategoryData[this.sizeCat]!.maxDim;
  }

  override minHeight(): number {
    return SizeCategoryData[this.sizeCat]!.minDim;
  }

  override maxHeight(): number {
    return SizeCategoryData[this.sizeCat]!.maxDim;
  }

  sizeFactor(): number {
    return SizeCategoryData[this.sizeCat]!.roomValue;
  }

  mobSpawnWeight(): number {
    if (this.isEntrance()) {
      return 1;
    }
    return this.sizeFactor();
  }

  connectionWeight(): number {
    return this.sizeFactor() * this.sizeFactor();
  }

  override canMerge(l: Level, _other: Room, p: Point, _mergeTerrain: number): boolean {
    const cell = l.pointToCell(this.pointInside(p, 1));
    return (flags[l.map[cell]!]! & Terrain.SOLID) === 0;
  }
}
