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

import { RegularLevel } from './RegularLevel';
import { SewerPainter } from './painters/SewerPainter';
import { RegularPainter } from './painters/RegularPainter';
import { Terrain, flags as terrainFlags } from './Terrain';
import { Dungeon } from './Dungeon';
import * as Random from '../utils/Random';
import { Rat } from '../actors/mobs/Rat';
import { Gnoll } from '../actors/mobs/Gnoll';
import { Crab } from '../actors/mobs/Crab';
import { Slime } from '../actors/mobs/Slime';
import { Snake } from '../actors/mobs/Snake';
import { Swarm } from '../actors/mobs/Swarm';

export class SewerLevel extends RegularLevel {

  constructor() {
    super();
    this.color1 = 0x618b45;
    this.color2 = 0x8da979;
  }

  override standardRooms(forceMax: boolean): number {
    if (forceMax) return 6;
    return 4 + Random.chances([1, 3, 1]);
  }

  override specialRooms(forceMax: boolean): number {
    if (forceMax) return 2;
    return 1 + Random.chances([1, 4]);
  }

  override painter(): RegularPainter {
    return new SewerPainter()
      .setWater(0.30, 5)
      .setGrass(0.20, 4)
      .setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }

  nTraps(): number {
    return Random.NormalIntRange(2, 3 + Math.floor(Dungeon.depth / 5));
  }

  trapClasses(): any[] {
    if (Dungeon.depth <= 1) {
      return [];
    }
    return [];
  }

  trapChances(): number[] {
    if (Dungeon.depth <= 1) {
      return [1];
    }
    return [1];
  }

  override createMob(): Rat | Gnoll | Crab | Slime | Snake | Swarm | null {
    const depth = Dungeon.depth;

    // Depth-based probability table [mob_class, weight]
    // Weights are relative to each other within the same depth
    const mobWeights: [new () => any, number][] = [];

    // Depth 1: mostly rats, occasional gnolls
    if (depth === 1) {
      mobWeights.push([Rat, 4], [Gnoll, 1]);
    }
    // Depth 2: rats common, gnolls common, crabs/snakes/slimes start
    else if (depth === 2) {
      mobWeights.push(
        [Rat, 3],
        [Gnoll, 2],
        [Crab, 1],
        [Snake, 0.5],
        [Slime, 0.5],
      );
    }
    // Depth 3: full sewer variety
    else if (depth === 3) {
      mobWeights.push(
        [Rat, 2],
        [Gnoll, 2],
        [Crab, 2],
        [Snake, 1],
        [Slime, 1],
        [Swarm, 0.5],
      );
    }
    // Depth 4: less rats, more of everything
    else {
      mobWeights.push(
        [Rat, 1],
        [Gnoll, 2],
        [Crab, 2],
        [Snake, 1],
        [Slime, 1.5],
        [Swarm, 1],
      );
    }

    const totalWeight = mobWeights.reduce((sum, [, w]) => sum + w, 0);
    let roll = Random.Float() * totalWeight;
    for (const [cls, weight] of mobWeights) {
      roll -= weight;
      if (roll <= 0) {
        return new cls();
      }
    }

    return new Rat();
  }

  override tilesTex(): string {
    return 'assets/environment/tiles_sewers.png';
  }

  override waterTex(): string {
    return 'assets/environment/water0.png';
  }

  override buildFlagMaps(): void {
    super.buildFlagMaps();
    for (let i = 0; i < this.length; i++) {
      if (this.map[i] === Terrain.REGION_DECO) {
        terrainFlags[Terrain.REGION_DECO] = Terrain.PASSABLE | Terrain.LOS_BLOCKING | Terrain.FLAMABLE;
      }
    }
  }
}
