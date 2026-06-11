// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Registry and factory for special rooms.
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom static methods.

export { SpecialRoom } from './SpecialRoom';
export { ShopRoom } from './ShopRoom';
export { PoolRoom } from './PoolRoom';
export { GardenRoom } from './GardenRoom';
export { LaboratoryRoom } from './LaboratoryRoom';
export { PitRoom } from './PitRoom';
export { WeakFloorRoom } from './WeakFloorRoom';
export { MagicWellRoom } from './MagicWellRoom';
export { TrapsRoom } from './TrapsRoom';
export { StatueRoom } from './StatueRoom';

import { Room } from '../Room';
import { SpecialRoom } from './SpecialRoom';
import { Dungeon } from '../../Dungeon';
import * as Random from '../../../utils/Random';

// Import all special room subclasses to trigger module evaluation / registration
import { PoolRoom } from './PoolRoom';
import { GardenRoom } from './GardenRoom';
import { LaboratoryRoom } from './LaboratoryRoom';
import { PitRoom } from './PitRoom';
import { WeakFloorRoom } from './WeakFloorRoom';
import { MagicWellRoom } from './MagicWellRoom';
import { TrapsRoom } from './TrapsRoom';
import { StatueRoom } from './StatueRoom';

// EQUIP_SPECIALS (9 rooms: give equipment more often than consumables)
const EQUIP_SPECIALS: (typeof SpecialRoom)[] = [
  WeakFloorRoom, PoolRoom, StatueRoom,
];

// CONSUMABLE_SPECIALS (10 rooms: give consumables more often than equipment)
const CONSUMABLE_SPECIALS: (typeof SpecialRoom)[] = [
  GardenRoom, MagicWellRoom, TrapsRoom,
];

// CRYSTAL_KEY_SPECIALS (only one per floor)
const CRYSTAL_KEY_SPECIALS: (typeof SpecialRoom)[] = [
  PitRoom,
];

// POTION_SPAWN_ROOMS (only one per floor)
const POTION_SPAWN_ROOMS: (typeof SpecialRoom)[] = [
  PoolRoom, TrapsRoom,
];

// ---- run-state ----

let runSpecials: (typeof Room)[] = [];
let floorSpecials: (typeof Room)[] = [];
let pitNeededDepth = -1;

export function initForRun(): void {
  runSpecials = [];

  const runEquip = [...EQUIP_SPECIALS];
  const runCons = [...CONSUMABLE_SPECIALS];

  Random.shuffle(runEquip);
  Random.shuffle(runCons);

  runSpecials.push(runCons.shift()!);

  while (runEquip.length > 0 || runCons.length > 0) {
    if (runEquip.length > 0) runSpecials.push(runEquip.shift()!);
    if (runCons.length > 0) runSpecials.push(runCons.shift()!);
  }

  pitNeededDepth = -1;
}

export function initForFloor(): void {
  floorSpecials = [...runSpecials];

  if (Dungeon.labRoomNeeded()) {
    Dungeon.LimitedDrops.LAB_ROOM.count++;
    floorSpecials.unshift(LaboratoryRoom);
  }
}

function useType(type: typeof Room): void {
  const fi = floorSpecials.indexOf(type);
  if (fi >= 0) floorSpecials.splice(fi, 1);

  if (CRYSTAL_KEY_SPECIALS.includes(type as typeof SpecialRoom)) {
    for (const t of CRYSTAL_KEY_SPECIALS) {
      const i = floorSpecials.indexOf(t);
      if (i >= 0) floorSpecials.splice(i, 1);
    }
  }

  if (POTION_SPAWN_ROOMS.includes(type as typeof SpecialRoom)) {
    for (const t of POTION_SPAWN_ROOMS) {
      const i = floorSpecials.indexOf(t);
      if (i >= 0) floorSpecials.splice(i, 1);
    }
  }

  const ri = runSpecials.indexOf(type);
  if (ri >= 0) {
    runSpecials.splice(ri, 1);
    runSpecials.push(type);
  }
}

export function resetPitRoom(depth: number): void {
  if (pitNeededDepth === depth) pitNeededDepth = -1;
}

export function createSpecialRoom(): SpecialRoom | null {
  if (Dungeon.depth === pitNeededDepth) {
    pitNeededDepth = -1;
    useType(PitRoom);
    return new PitRoom();
  }

  if (floorSpecials.includes(LaboratoryRoom)) {
    useType(LaboratoryRoom);
    return new LaboratoryRoom();
  }

  if (Dungeon.bossLevel(Dungeon.depth + 1)) {
    const wfi = floorSpecials.indexOf(WeakFloorRoom);
    if (wfi >= 0) floorSpecials.splice(wfi, 1);
  }

  const index = Random.chances([6, 3, 1]);
  let adjusted = index;
  while (adjusted >= floorSpecials.length) adjusted--;
  if (adjusted < 0) return null;

  const cls = floorSpecials[adjusted] as unknown as new () => SpecialRoom;
  const room = new cls();

  if (room instanceof WeakFloorRoom) {
    pitNeededDepth = Dungeon.depth + 1;
  }

  useType(cls as unknown as typeof Room);
  return room;
}
