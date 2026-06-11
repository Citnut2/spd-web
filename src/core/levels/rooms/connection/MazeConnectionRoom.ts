// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.MazeConnectionRoom

import { ConnectionRoom } from './ConnectionRoom';
import { Level } from '../../Level';
import { Terrain } from '../../Terrain';
import { Painter } from '../../painters/Painter';
import { Maze } from '../../features/Maze';
import { DoorType } from '../Room';

export class MazeConnectionRoom extends ConnectionRoom {

  override paint(level: Level): void {
    Painter.fill(level, this, 1, Terrain.EMPTY);

    Maze.allowDiagonals = false;
    let maze = Maze.generate(this);

    while (this.width() >= 5 && this.height() >= 5
      && (this.width() <= 7 || this.height() <= 7)
      && maze[Math.floor(this.width() / 2)]![Math.floor(this.height() / 2)] === Maze.EMPTY) {
      maze = Maze.generate(this);
    }

    Painter.fill(level, this, 1, Terrain.EMPTY);
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0]!.length; y++) {
        if (maze[x]![y] === Maze.FILLED) {
          Painter.fill(level, x + this.left, y + this.top, 1, 1, Terrain.WALL);
        }
      }
    }

    for (const door of this.connected.values()) {
      door.set(DoorType.HIDDEN);
    }
  }

  override maxConnections(_direction: number): number {
    return 2;
  }
}
