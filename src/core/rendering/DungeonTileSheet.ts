// Port of com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet

import { Terrain } from '../levels/Terrain';
import { SparseArray } from '../utils/SparseArray';
import * as Random from '../utils/Random';

const WIDTH = 16;

function xy(x: number, y: number): number {
  x -= 1; y -= 1;
  return x + WIDTH * y;
}

export const NULL_TILE = -1;

// ── Floor Tiles ──────────────────────────────────────────────────────────

const GROUND         = xy(1, 1);
export const FLOOR           = GROUND + 0;
export const FLOOR_DECO      = GROUND + 1;
export const GRASS           = GROUND + 2;
export const EMBERS          = GROUND + 3;
export const FLOOR_SP        = GROUND + 4;

export const FLOOR_ALT_1     = GROUND + 6;
export const FLOOR_DECO_ALT  = GROUND + 7;
export const GRASS_ALT       = GROUND + 8;
export const EMBERS_ALT      = GROUND + 9;
export const FLOOR_SP_ALT    = GROUND + 10;

export const FLOOR_ALT_2     = GROUND + 12;

export const ENTRANCE        = GROUND + 16;
export const EXIT            = GROUND + 17;
export const WELL            = GROUND + 18;
export const EMPTY_WELL      = GROUND + 19;
export const PEDESTAL        = GROUND + 20;

export const ENTRANCE_SP     = GROUND + 22;

export const CHASM           = xy(9, 2);
export const CHASM_FLOOR     = CHASM + 1;
export const CHASM_FLOOR_SP  = CHASM + 2;
export const CHASM_WALL      = CHASM + 3;
export const CHASM_WATER     = CHASM + 4;

// ── Chasm stitching ──────────────────────────────────────────────────────

export const chasmStitcheable = new SparseArray<number>();
chasmStitcheable.put(Terrain.EMPTY,             CHASM_FLOOR);
chasmStitcheable.put(Terrain.GRASS,             CHASM_FLOOR);
chasmStitcheable.put(Terrain.EMBERS,            CHASM_FLOOR);
chasmStitcheable.put(Terrain.EMPTY_WELL,        CHASM_FLOOR);
chasmStitcheable.put(Terrain.HIGH_GRASS,        CHASM_FLOOR);
chasmStitcheable.put(Terrain.FURROWED_GRASS,    CHASM_FLOOR);
chasmStitcheable.put(Terrain.EMPTY_DECO,        CHASM_FLOOR);
chasmStitcheable.put(Terrain.CUSTOM_DECO,       CHASM_FLOOR);
chasmStitcheable.put(Terrain.WELL,              CHASM_FLOOR);
chasmStitcheable.put(Terrain.STATUE,            CHASM_FLOOR);
chasmStitcheable.put(Terrain.REGION_DECO,       CHASM_FLOOR);
chasmStitcheable.put(Terrain.SECRET_TRAP,       CHASM_FLOOR);
chasmStitcheable.put(Terrain.INACTIVE_TRAP,     CHASM_FLOOR);
chasmStitcheable.put(Terrain.TRAP,              CHASM_FLOOR);
chasmStitcheable.put(Terrain.BOOKSHELF,         CHASM_FLOOR);
chasmStitcheable.put(Terrain.BARRICADE,         CHASM_FLOOR);
chasmStitcheable.put(Terrain.PEDESTAL,          CHASM_FLOOR);
chasmStitcheable.put(Terrain.CUSTOM_DECO_EMPTY, CHASM_FLOOR);
chasmStitcheable.put(Terrain.MINE_BOULDER,      CHASM_FLOOR);
chasmStitcheable.put(Terrain.MINE_CRYSTAL,      CHASM_FLOOR);

chasmStitcheable.put(Terrain.EMPTY_SP,          CHASM_FLOOR_SP);
chasmStitcheable.put(Terrain.STATUE_SP,         CHASM_FLOOR_SP);

chasmStitcheable.put(Terrain.WALL,              CHASM_WALL);
chasmStitcheable.put(Terrain.DOOR,              CHASM_WALL);
chasmStitcheable.put(Terrain.OPEN_DOOR,         CHASM_WALL);
chasmStitcheable.put(Terrain.LOCKED_DOOR,       CHASM_WALL);
chasmStitcheable.put(Terrain.HERO_LKD_DR,       CHASM_WALL);
chasmStitcheable.put(Terrain.SECRET_DOOR,       CHASM_WALL);
chasmStitcheable.put(Terrain.WALL_DECO,         CHASM_WALL);

chasmStitcheable.put(Terrain.WATER,             CHASM_WATER);

// ── Water Tiles ──────────────────────────────────────────────────────────

export const WATER = xy(1, 3);

export const waterStitcheableSet = new Set<number>([
  Terrain.EMPTY, Terrain.GRASS, Terrain.EMPTY_WELL,
  Terrain.ENTRANCE, Terrain.EXIT, Terrain.EMBERS,
  Terrain.BARRICADE, Terrain.HIGH_GRASS, Terrain.FURROWED_GRASS, Terrain.SECRET_TRAP,
  Terrain.TRAP, Terrain.INACTIVE_TRAP, Terrain.EMPTY_DECO,
  Terrain.CUSTOM_DECO, Terrain.WELL, Terrain.STATUE, Terrain.REGION_DECO, Terrain.ALCHEMY,
  Terrain.CUSTOM_DECO_EMPTY, Terrain.MINE_CRYSTAL, Terrain.MINE_BOULDER,
  Terrain.DOOR, Terrain.OPEN_DOOR, Terrain.LOCKED_DOOR, Terrain.HERO_LKD_DR, Terrain.CRYSTAL_DOOR,
]);

// ── Flat Tiles ───────────────────────────────────────────────────────────

const FLAT_WALLS              = xy(1, 4);
export const FLAT_WALL        = FLAT_WALLS + 0;
export const FLAT_WALL_DECO   = FLAT_WALLS + 1;
export const FLAT_BOOKSHELF   = FLAT_WALLS + 2;

export const FLAT_WALL_ALT       = FLAT_WALLS + 4;
export const FLAT_WALL_DECO_ALT  = FLAT_WALLS + 5;
export const FLAT_BOOKSHELF_ALT  = FLAT_WALLS + 6;

export const FLAT_DOOR          = FLAT_WALLS + 8;
export const FLAT_DOOR_OPEN     = FLAT_WALLS + 9;
export const FLAT_DOOR_LOCKED   = FLAT_WALLS + 10;
export const FLAT_DOOR_CRYSTAL  = FLAT_WALLS + 11;
export const UNLOCKED_EXIT      = FLAT_WALLS + 12;
export const LOCKED_EXIT        = FLAT_WALLS + 13;

const FLAT_OTHER               = xy(1, 5);
export const FLAT_ALCHEMY_POT     = FLAT_OTHER + 0;
export const FLAT_BARRICADE        = FLAT_OTHER + 1;
export const FLAT_HIGH_GRASS       = FLAT_OTHER + 2;
export const FLAT_FURROWED_GRASS   = FLAT_OTHER + 3;

export const FLAT_HIGH_GRASS_ALT   = FLAT_OTHER + 5;
export const FLAT_FURROWED_ALT     = FLAT_OTHER + 6;

export const FLAT_STATUE           = FLAT_OTHER + 8;
export const FLAT_STATUE_SP        = FLAT_OTHER + 9;
export const FLAT_REGION_DECO      = FLAT_OTHER + 10;
export const FLAT_REGION_DECO_ALT  = FLAT_OTHER + 11;

export const FLAT_MINE_CRYSTAL       = FLAT_OTHER + 12;
export const FLAT_MINE_CRYSTAL_ALT   = FLAT_OTHER + 13;
export const FLAT_MINE_CRYSTAL_ALT_2 = FLAT_OTHER + 14;
export const FLAT_MINE_BOULDER       = FLAT_OTHER + 12;
export const FLAT_MINE_BOULDER_ALT   = FLAT_OTHER + 13;
export const FLAT_MINE_BOULDER_ALT_2 = FLAT_OTHER + 14;

// ── Raised Tiles, Lower Layer ────────────────────────────────────────────

const RAISED_WALLS                 = xy(1, 6);
export const RAISED_WALL           = RAISED_WALLS + 0;
export const RAISED_WALL_DECO      = RAISED_WALLS + 4;
export const RAISED_WALL_DOOR      = RAISED_WALLS + 8;
export const RAISED_WALL_BOOKSHELF = RAISED_WALLS + 12;

export const RAISED_WALL_ALT           = RAISED_WALLS + 16;
export const RAISED_WALL_DECO_ALT      = RAISED_WALLS + 20;
export const RAISED_WALL_BOOKSHELF_ALT = RAISED_WALLS + 28;

export const wallStitcheableArr = [
  Terrain.WALL, Terrain.WALL_DECO, Terrain.SECRET_DOOR,
  Terrain.LOCKED_EXIT, Terrain.UNLOCKED_EXIT, Terrain.BOOKSHELF, NULL_TILE,
];

export function wallStitcheable(tile: number): boolean {
  for (const t of wallStitcheableArr) {
    if (tile === t) return true;
  }
  return false;
}

// ── Raised Doors ─────────────────────────────────────────────────────────

const RAISED_DOORS            = xy(1, 8);
export const RAISED_DOOR         = RAISED_DOORS + 0;
export const RAISED_DOOR_OPEN    = RAISED_DOORS + 1;
export const RAISED_DOOR_LOCKED  = RAISED_DOORS + 2;
export const RAISED_DOOR_CRYSTAL = RAISED_DOORS + 3;
export const RAISED_DOOR_SIDEWAYS = RAISED_DOORS + 4;

// ── Raised Other ─────────────────────────────────────────────────────────

const RAISED_OTHER                 = xy(9, 8);
export const RAISED_ALCHEMY_POT        = RAISED_OTHER + 0;
export const RAISED_BARRICADE          = RAISED_OTHER + 1;
export const RAISED_HIGH_GRASS         = RAISED_OTHER + 2;
export const RAISED_FURROWED_GRASS     = RAISED_OTHER + 3;

export const RAISED_HIGH_GRASS_ALT     = RAISED_OTHER + 5;
export const RAISED_FURROWED_ALT       = RAISED_OTHER + 6;

export const RAISED_STATUE             = RAISED_OTHER + 8;
export const RAISED_STATUE_SP          = RAISED_OTHER + 9;
export const RAISED_REGION_DECO        = RAISED_OTHER + 10;
export const RAISED_REGION_DECO_ALT    = RAISED_OTHER + 11;

export const RAISED_MINE_CRYSTAL       = RAISED_OTHER + 12;
export const RAISED_MINE_CRYSTAL_ALT   = RAISED_OTHER + 13;
export const RAISED_MINE_CRYSTAL_ALT_2 = RAISED_OTHER + 14;
export const RAISED_MINE_BOULDER       = RAISED_OTHER + 12;
export const RAISED_MINE_BOULDER_ALT   = RAISED_OTHER + 13;
export const RAISED_MINE_BOULDER_ALT_2 = RAISED_OTHER + 14;

// ── Raised Tiles, Upper Layer (Wall Internal / Overhang) ─────────────────

export const WALLS_INTERNAL           = xy(1, 10);
const WALL_INTERNAL                   = WALLS_INTERNAL + 0;
const WALL_INTERNAL_WOODEN            = WALLS_INTERNAL + 32;

export const WALLS_OVERHANG           = xy(1, 13);
export const WALL_OVERHANG            = WALLS_OVERHANG + 0;
export const WALL_OVERHANG_DECO       = WALLS_OVERHANG + 4;
export const WALL_OVERHANG_WOODEN     = WALLS_OVERHANG + 8;
export const DOOR_SIDEWAYS_OVERHANG   = WALLS_OVERHANG + 16;
export const DOOR_SIDEWAYS_OVERHANG_CLOSED = WALLS_OVERHANG + 20;
export const DOOR_SIDEWAYS_OVERHANG_LOCKED = WALLS_OVERHANG + 24;
export const DOOR_SIDEWAYS_OVERHANG_CRYSTAL = WALLS_OVERHANG + 28;

export const DOOR_OVERHANG        = xy(1, 15);
export const DOOR_OVERHANG_OPEN   = DOOR_OVERHANG + 1;
export const DOOR_OVERHANG_CRYSTAL = DOOR_OVERHANG + 2;
export const DOOR_SIDEWAYS2       = DOOR_OVERHANG + 3;
export const DOOR_SIDEWAYS_LOCKED = DOOR_OVERHANG + 4;
export const DOOR_SIDEWAYS_CRYSTAL = DOOR_OVERHANG + 5;
export const EXIT_UNDERHANG       = DOOR_OVERHANG + 6;

const OTHER_OVERHANG             = xy(9, 15);
export const ALCHEMY_POT_OVERHANG      = OTHER_OVERHANG + 0;
export const BARRICADE_OVERHANG        = OTHER_OVERHANG + 1;
export const HIGH_GRASS_OVERHANG       = OTHER_OVERHANG + 2;
export const FURROWED_OVERHANG         = OTHER_OVERHANG + 3;

export const HIGH_GRASS_OVERHANG_ALT   = OTHER_OVERHANG + 5;
export const FURROWED_OVERHANG_ALT     = OTHER_OVERHANG + 6;

export const STATUE_OVERHANG           = OTHER_OVERHANG + 8;
export const STATUE_SP_OVERHANG        = OTHER_OVERHANG + 9;
export const REGION_DECO_OVERHANG      = OTHER_OVERHANG + 10;
export const REGION_DECO_ALT_OVERHANG  = OTHER_OVERHANG + 11;

export const MINE_CRYSTAL_OVERHANG       = OTHER_OVERHANG + 12;
export const MINE_CRYSTAL_OVERHANG_ALT   = OTHER_OVERHANG + 13;
export const MINE_CRYSTAL_OVERHANG_ALT_2 = OTHER_OVERHANG + 14;
export const MINE_BOULDER_OVERHANG       = OTHER_OVERHANG + 12;
export const MINE_BOULDER_OVERHANG_ALT   = OTHER_OVERHANG + 13;
export const MINE_BOULDER_OVERHANG_ALT_2 = OTHER_OVERHANG + 14;

export const HIGH_GRASS_UNDERHANG      = OTHER_OVERHANG + 18;
export const FURROWED_UNDERHANG        = OTHER_OVERHANG + 19;
export const HIGH_GRASS_UNDERHANG_ALT  = OTHER_OVERHANG + 21;
export const FURROWED_UNDERHANG_ALT    = OTHER_OVERHANG + 22;

const doorTilesArr = [
  Terrain.DOOR, Terrain.LOCKED_DOOR, Terrain.HERO_LKD_DR, Terrain.CRYSTAL_DOOR, Terrain.OPEN_DOOR,
];

export function doorTile(tile: number): boolean {
  for (const t of doorTilesArr) {
    if (tile === t) return true;
  }
  return false;
}

// ── Direct Visuals ───────────────────────────────────────────────────────

export const directVisuals = new SparseArray<number>();
directVisuals.put(Terrain.EMPTY,             FLOOR);
directVisuals.put(Terrain.GRASS,             GRASS);
directVisuals.put(Terrain.EMPTY_WELL,        EMPTY_WELL);
directVisuals.put(Terrain.ENTRANCE,          ENTRANCE);
directVisuals.put(Terrain.EXIT,              EXIT);
directVisuals.put(Terrain.EMBERS,            EMBERS);
directVisuals.put(Terrain.PEDESTAL,          PEDESTAL);
directVisuals.put(Terrain.EMPTY_SP,          FLOOR_SP);
directVisuals.put(Terrain.ENTRANCE_SP,       ENTRANCE_SP);

directVisuals.put(Terrain.SECRET_TRAP,       directVisuals.get(Terrain.EMPTY, FLOOR));
directVisuals.put(Terrain.TRAP,              directVisuals.get(Terrain.EMPTY, FLOOR));
directVisuals.put(Terrain.INACTIVE_TRAP,     directVisuals.get(Terrain.EMPTY, FLOOR));
directVisuals.put(Terrain.CUSTOM_DECO,       directVisuals.get(Terrain.EMPTY, FLOOR));
directVisuals.put(Terrain.CUSTOM_DECO_EMPTY, directVisuals.get(Terrain.EMPTY, FLOOR));

directVisuals.put(Terrain.EMPTY_DECO,        FLOOR_DECO);
directVisuals.put(Terrain.LOCKED_EXIT,       LOCKED_EXIT);
directVisuals.put(Terrain.UNLOCKED_EXIT,     UNLOCKED_EXIT);
directVisuals.put(Terrain.WELL,              WELL);

export const directFlatVisuals = new SparseArray<number>();
directFlatVisuals.put(Terrain.WALL,           FLAT_WALL);
directFlatVisuals.put(Terrain.DOOR,           FLAT_DOOR);
directFlatVisuals.put(Terrain.OPEN_DOOR,      FLAT_DOOR_OPEN);
directFlatVisuals.put(Terrain.LOCKED_DOOR,    FLAT_DOOR_LOCKED);
directFlatVisuals.put(Terrain.HERO_LKD_DR,    FLAT_DOOR_LOCKED);
directFlatVisuals.put(Terrain.CRYSTAL_DOOR,   FLAT_DOOR_CRYSTAL);
directFlatVisuals.put(Terrain.WALL_DECO,      FLAT_WALL_DECO);
directFlatVisuals.put(Terrain.BOOKSHELF,      FLAT_BOOKSHELF);
directFlatVisuals.put(Terrain.ALCHEMY,        FLAT_ALCHEMY_POT);
directFlatVisuals.put(Terrain.BARRICADE,      FLAT_BARRICADE);
directFlatVisuals.put(Terrain.HIGH_GRASS,     FLAT_HIGH_GRASS);
directFlatVisuals.put(Terrain.FURROWED_GRASS, FLAT_FURROWED_GRASS);

directFlatVisuals.put(Terrain.STATUE,         FLAT_STATUE);
directFlatVisuals.put(Terrain.STATUE_SP,      FLAT_STATUE_SP);
directFlatVisuals.put(Terrain.REGION_DECO,    FLAT_REGION_DECO);
directFlatVisuals.put(Terrain.REGION_DECO_ALT, FLAT_REGION_DECO_ALT);

directFlatVisuals.put(Terrain.MINE_CRYSTAL,   FLAT_MINE_CRYSTAL);
directFlatVisuals.put(Terrain.MINE_BOULDER,   FLAT_MINE_BOULDER);

directFlatVisuals.put(Terrain.SECRET_DOOR,    directFlatVisuals.get(Terrain.WALL, FLAT_WALL));

// ── Tile Variance ────────────────────────────────────────────────────────

export let tileVariance: Int8Array = new Int8Array(0);

export function setupVariance(size: number, seed: number): void {
  Random.pushGenerator(seed);

  tileVariance = new Int8Array(size);
  for (let i = 0; i < tileVariance.length; i++) {
    tileVariance[i] = Random.Int(100);
  }

  Random.popGenerator();
}

export const commonAltVisuals = new SparseArray<number>();
commonAltVisuals.put(FLOOR,                  FLOOR_ALT_1);
commonAltVisuals.put(GRASS,                  GRASS_ALT);
commonAltVisuals.put(FLAT_WALL,              FLAT_WALL_ALT);
commonAltVisuals.put(EMBERS,                 EMBERS_ALT);
commonAltVisuals.put(FLAT_WALL_DECO,         FLAT_WALL_DECO_ALT);
commonAltVisuals.put(FLOOR_SP,               FLOOR_SP_ALT);
commonAltVisuals.put(FLOOR_DECO,             FLOOR_DECO_ALT);

commonAltVisuals.put(FLAT_BOOKSHELF,         FLAT_BOOKSHELF_ALT);
commonAltVisuals.put(FLAT_HIGH_GRASS,        FLAT_HIGH_GRASS_ALT);
commonAltVisuals.put(FLAT_FURROWED_GRASS,    FLAT_FURROWED_ALT);
commonAltVisuals.put(FLAT_MINE_CRYSTAL,      FLAT_MINE_CRYSTAL_ALT);
commonAltVisuals.put(FLAT_MINE_BOULDER,      FLAT_MINE_BOULDER_ALT);

commonAltVisuals.put(RAISED_WALL,            RAISED_WALL_ALT);
commonAltVisuals.put(RAISED_WALL_DECO,       RAISED_WALL_DECO_ALT);
commonAltVisuals.put(RAISED_WALL_BOOKSHELF,  RAISED_WALL_BOOKSHELF_ALT);

commonAltVisuals.put(RAISED_HIGH_GRASS,      RAISED_HIGH_GRASS_ALT);
commonAltVisuals.put(RAISED_FURROWED_GRASS,  RAISED_FURROWED_ALT);
commonAltVisuals.put(HIGH_GRASS_OVERHANG,    HIGH_GRASS_OVERHANG_ALT);
commonAltVisuals.put(FURROWED_OVERHANG,      FURROWED_OVERHANG_ALT);
commonAltVisuals.put(RAISED_MINE_CRYSTAL,    RAISED_MINE_CRYSTAL_ALT);
commonAltVisuals.put(RAISED_MINE_BOULDER,    RAISED_MINE_BOULDER_ALT);
commonAltVisuals.put(HIGH_GRASS_UNDERHANG,   HIGH_GRASS_UNDERHANG_ALT);
commonAltVisuals.put(FURROWED_UNDERHANG,     FURROWED_UNDERHANG_ALT);
commonAltVisuals.put(MINE_CRYSTAL_OVERHANG,  MINE_CRYSTAL_OVERHANG_ALT);
commonAltVisuals.put(MINE_BOULDER_OVERHANG,  MINE_BOULDER_OVERHANG_ALT);

export const rareAltVisuals = new SparseArray<number>();
rareAltVisuals.put(FLOOR,                    FLOOR_ALT_2);
rareAltVisuals.put(FLAT_MINE_CRYSTAL,        FLAT_MINE_CRYSTAL_ALT_2);
rareAltVisuals.put(FLAT_MINE_BOULDER,        FLAT_MINE_BOULDER_ALT_2);
rareAltVisuals.put(RAISED_MINE_CRYSTAL,      RAISED_MINE_CRYSTAL_ALT_2);
rareAltVisuals.put(RAISED_MINE_BOULDER,      RAISED_MINE_BOULDER_ALT_2);
rareAltVisuals.put(MINE_CRYSTAL_OVERHANG,    MINE_CRYSTAL_OVERHANG_ALT_2);
rareAltVisuals.put(MINE_BOULDER_OVERHANG,    MINE_BOULDER_OVERHANG_ALT_2);

export function getVisualWithAlts(visual: number, pos: number): number {
  const v = tileVariance[pos];
  if (v === undefined) return visual;
  if (v >= 95 && rareAltVisuals.containsKey(visual)) {
    return rareAltVisuals.get(visual, visual);
  } else if (v >= 50 && commonAltVisuals.containsKey(visual)) {
    return commonAltVisuals.get(visual, visual);
  }
  return visual;
}

// ── Stitching Functions ──────────────────────────────────────────────────

export function floorTile(tile: number): boolean {
  return tile === Terrain.WATER || directVisuals.get(tile, CHASM) < CHASM;
}

export function waterStitcheableFn(tile: number): boolean {
  return waterStitcheableSet.has(tile);
}

export function stitchChasmTile(above: number | undefined): number {
  if (above === undefined) return CHASM;
  return chasmStitcheable.get(above, CHASM);
}

export function stitchWaterTile(
  top: number, right: number, bottom: number, left: number
): number {
  let result = WATER;
  if (waterStitcheableSet.has(top))    result += 1;
  if (waterStitcheableSet.has(right))  result += 2;
  if (waterStitcheableSet.has(bottom)) result += 4;
  if (waterStitcheableSet.has(left))   result += 8;
  return result;
}

export function getRaisedWallTile(
  tile: number, _pos: number, right: number, below: number, left: number
): number {
  let result: number;

  if (below === -1 || wallStitcheable(below)) return -1;
  else if (doorTile(below))                     result = RAISED_WALL_DOOR;
  else if (tile === Terrain.WALL || tile === Terrain.SECRET_DOOR) result = RAISED_WALL;
  else if (tile === Terrain.WALL_DECO)          result = RAISED_WALL_DECO;
  else if (tile === Terrain.BOOKSHELF)          result = RAISED_WALL_BOOKSHELF;
  else return -1;

  result = getVisualWithAlts(result, _pos);

  if (!wallStitcheable(right)) result += 1;
  if (!wallStitcheable(left))  result += 2;
  return result;
}

export function getRaisedDoorTile(tile: number, below: number): number {
  if (wallStitcheable(below))                       return RAISED_DOOR_SIDEWAYS;
  else if (tile === Terrain.DOOR)                   return RAISED_DOOR;
  else if (tile === Terrain.OPEN_DOOR)              return RAISED_DOOR_OPEN;
  else if (tile === Terrain.LOCKED_DOOR)            return RAISED_DOOR_LOCKED;
  else if (tile === Terrain.HERO_LKD_DR)            return RAISED_DOOR_LOCKED;
  else if (tile === Terrain.CRYSTAL_DOOR)           return RAISED_DOOR_CRYSTAL;
  else return -1;
}

export function stitchInternalWallTile(
  tile: number, right: number, rightBelow: number, below: number,
  leftBelow: number, left: number
): number {
  let result: number;
  if (tile === Terrain.BOOKSHELF || below === Terrain.BOOKSHELF) result = WALL_INTERNAL_WOODEN;
  else result = WALL_INTERNAL;

  if (!wallStitcheable(right))      result += 1;
  if (!wallStitcheable(rightBelow)) result += 2;
  if (!wallStitcheable(leftBelow))  result += 4;
  if (!wallStitcheable(left))       result += 8;
  return result;
}

export function stitchWallOverhangTile(
  tile: number, rightBelow: number, below: number, leftBelow: number
): number {
  let visual: number;
  if (tile === Terrain.OPEN_DOOR)                       visual = DOOR_SIDEWAYS_OVERHANG;
  else if (tile === Terrain.DOOR)                       visual = DOOR_SIDEWAYS_OVERHANG_CLOSED;
  else if (tile === Terrain.LOCKED_DOOR)                visual = DOOR_SIDEWAYS_OVERHANG_LOCKED;
  else if (tile === Terrain.HERO_LKD_DR)                visual = DOOR_SIDEWAYS_OVERHANG_LOCKED;
  else if (tile === Terrain.CRYSTAL_DOOR)               visual = DOOR_SIDEWAYS_OVERHANG_CRYSTAL;
  else if (below === Terrain.BOOKSHELF)                 visual = WALL_OVERHANG_WOODEN;
  else                                                  visual = WALL_OVERHANG;

  if (!wallStitcheable(rightBelow)) visual += 1;
  if (!wallStitcheable(leftBelow))  visual += 2;

  return visual;
}
