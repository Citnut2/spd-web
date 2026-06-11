// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ShopRoom

import { SpecialRoom } from './SpecialRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { DoorType } from '../Room';

export class ShopRoom extends SpecialRoom {

  override minWidth(): number {
    return Math.max(7, Math.floor(Math.sqrt(this.spacesNeeded())) + 3);
  }

  override minHeight(): number {
    return Math.max(7, Math.floor(Math.sqrt(this.spacesNeeded())) + 3);
  }

  protected spacesNeeded(): number {
    return 9;
  }

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.WALL);
    Painter.fill(level, this, 1, Terrain.EMPTY_SP);

    this.placeShopkeeper(level);
    this.placeItems(level);

    for (const door of this.connected.values()) {
      door.set(DoorType.REGULAR);
    }
  }

  protected placeShopkeeper(_level: Level): void {
    // TODO: spawn Shopkeeper NPC
  }

  protected placeItems(_level: Level): void {
    // TODO: place shop items using clockwise pattern from entrance
  }
}
