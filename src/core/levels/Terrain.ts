// Port of com.shatteredpixel.shatteredpixeldungeon.levels.Terrain

export const Terrain = {
  CHASM:           0,
  EMPTY:           1,
  GRASS:           2,
  EMPTY_WELL:      3,
  WALL:            4,
  DOOR:            5,
  OPEN_DOOR:       6,
  ENTRANCE:        7,
  ENTRANCE_SP:     37,
  EXIT:            8,
  EMBERS:          9,
  LOCKED_DOOR:     10,
  HERO_LKD_DR:     38,
  CRYSTAL_DOOR:    31,
  PEDESTAL:        11,
  WALL_DECO:       12,
  BARRICADE:       13,
  EMPTY_SP:        14,
  HIGH_GRASS:      15,
  FURROWED_GRASS:  30,

  SECRET_DOOR:     16,
  SECRET_TRAP:     17,
  TRAP:            18,
  INACTIVE_TRAP:   19,

  EMPTY_DECO:      20,
  LOCKED_EXIT:     21,
  UNLOCKED_EXIT:   22,
  WELL:            24,
  BOOKSHELF:       27,
  ALCHEMY:         28,

  CUSTOM_DECO_EMPTY: 32,
  CUSTOM_DECO:     23,
  STATUE:          25,
  STATUE_SP:       26,
  REGION_DECO:     33,
  REGION_DECO_ALT: 34,
  MINE_CRYSTAL:    35,
  MINE_BOULDER:    36,

  WATER:           29,

  // Flag constants
  PASSABLE:      0x01,
  LOS_BLOCKING:  0x02,
  FLAMABLE:      0x04,
  SECRET:        0x08,
  SOLID:         0x10,
  AVOID:         0x20,
  LIQUID:        0x40,
  PIT:           0x80,
} as const;

export const flags: number[] = new Array<number>(256).fill(0);
flags[Terrain.CHASM]         = Terrain.AVOID | Terrain.PIT;
flags[Terrain.EMPTY]         = Terrain.PASSABLE;
flags[Terrain.GRASS]         = Terrain.PASSABLE | Terrain.FLAMABLE;
flags[Terrain.EMPTY_WELL]    = Terrain.PASSABLE;
flags[Terrain.WATER]         = Terrain.PASSABLE | Terrain.LIQUID;
flags[Terrain.WALL]          = Terrain.LOS_BLOCKING | Terrain.SOLID;
flags[Terrain.DOOR]          = Terrain.PASSABLE | Terrain.LOS_BLOCKING | Terrain.FLAMABLE | Terrain.SOLID;
flags[Terrain.OPEN_DOOR]     = Terrain.PASSABLE | Terrain.FLAMABLE;
flags[Terrain.ENTRANCE]      = Terrain.PASSABLE;
flags[Terrain.ENTRANCE_SP]   = flags[Terrain.ENTRANCE]!;
flags[Terrain.EXIT]          = Terrain.PASSABLE;
flags[Terrain.EMBERS]        = Terrain.PASSABLE;
flags[Terrain.LOCKED_DOOR]   = Terrain.LOS_BLOCKING | Terrain.SOLID;
flags[Terrain.HERO_LKD_DR]   = flags[Terrain.LOCKED_DOOR]!;
flags[Terrain.CRYSTAL_DOOR]  = Terrain.SOLID;
flags[Terrain.PEDESTAL]      = Terrain.PASSABLE;
flags[Terrain.WALL_DECO]     = flags[Terrain.WALL]!;
flags[Terrain.BARRICADE]     = Terrain.FLAMABLE | Terrain.SOLID | Terrain.LOS_BLOCKING;
flags[Terrain.EMPTY_SP]      = flags[Terrain.EMPTY]!;
flags[Terrain.HIGH_GRASS]    = Terrain.PASSABLE | Terrain.LOS_BLOCKING | Terrain.FLAMABLE;
flags[Terrain.FURROWED_GRASS]= flags[Terrain.HIGH_GRASS]!;

flags[Terrain.SECRET_DOOR]   = flags[Terrain.WALL]! | Terrain.SECRET;
flags[Terrain.SECRET_TRAP]   = flags[Terrain.EMPTY]! | Terrain.SECRET;
flags[Terrain.TRAP]          = Terrain.AVOID;
flags[Terrain.INACTIVE_TRAP] = flags[Terrain.EMPTY]!;

flags[Terrain.EMPTY_DECO]    = flags[Terrain.EMPTY]!;
flags[Terrain.LOCKED_EXIT]   = Terrain.SOLID;
flags[Terrain.UNLOCKED_EXIT] = Terrain.PASSABLE;
flags[Terrain.WELL]          = Terrain.AVOID;
flags[Terrain.BOOKSHELF]     = flags[Terrain.BARRICADE]!;
flags[Terrain.ALCHEMY]       = Terrain.SOLID;

flags[Terrain.CUSTOM_DECO_EMPTY] = flags[Terrain.EMPTY]!;
flags[Terrain.CUSTOM_DECO]   = Terrain.SOLID;
flags[Terrain.STATUE]        = Terrain.SOLID;
flags[Terrain.STATUE_SP]     = flags[Terrain.STATUE]!;

flags[Terrain.REGION_DECO]   = flags[Terrain.STATUE]!;
flags[Terrain.REGION_DECO_ALT] = flags[Terrain.STATUE_SP]!;
flags[Terrain.MINE_CRYSTAL]  = Terrain.SOLID;
flags[Terrain.MINE_BOULDER]  = Terrain.SOLID;

export function getFlags(t: number): number {
  return flags[t] ?? 0;
}

export function isPassable(t: number): boolean {
  return (flags[t]! & Terrain.PASSABLE) !== 0;
}

export function isSolid(t: number): boolean {
  return (flags[t]! & Terrain.SOLID) !== 0;
}

export function isLosBlocking(t: number): boolean {
  return (flags[t]! & Terrain.LOS_BLOCKING) !== 0;
}

export function isLiquid(t: number): boolean {
  return (flags[t]! & Terrain.LIQUID) !== 0;
}

export function isAvoid(t: number): boolean {
  return (flags[t]! & Terrain.AVOID) !== 0;
}

export function isPit(t: number): boolean {
  return (flags[t]! & Terrain.PIT) !== 0;
}
