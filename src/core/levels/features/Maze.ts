// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.

import { Room } from '../rooms/Room';
import * as Random from '../../utils/Random';

export class Maze {

  static EMPTY = false;
  static FILLED = true;

  static allowDiagonals = false;

  static generate(r: Room): boolean[][] {
    const maze: boolean[][] = [];
    for (let x = 0; x < r.width(); x++) {
      maze[x] = [];
      for (let y = 0; y < r.height(); y++) {
        maze[x]![y] = false;
      }
    }

    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0]!.length; y++) {
        if (x === 0 || x === maze.length - 1 ||
          y === 0 || y === maze[0]!.length - 1) {
          maze[x]![y] = Maze.FILLED;
        }
      }
    }

    for (const d of r.connected.values()) {
      maze[d.x - r.left]![d.y - r.top] = Maze.EMPTY;
    }

    return Maze.generateMaze(maze);
  }

  static generateMaze(maze: boolean[][]): boolean[][] {
    let fails = 0;
    let x: number, y: number, moves: number;
    let mov: number[] | null;
    while (fails < 2500) {
      do {
        x = Random.Int(maze.length);
        y = Random.Int(maze[0]!.length);
      } while (!maze[x]![y]!);

      mov = Maze.decideDirection(maze, x, y);
      if (mov == null) {
        fails++;
      } else {
        fails = 0;
        moves = 0;
        do {
          x += mov[0]!;
          y += mov[1]!;
          maze[x]![y] = Maze.FILLED;
          moves++;
        } while (Random.Int(moves) === 0 && Maze.checkValidMove(maze, x, y, mov));
      }
    }
    return maze;
  }

  private static decideDirection(maze: boolean[][], x: number, y: number): number[] | null {
    if (Random.Int(4) === 0 && Maze.checkValidMove(maze, x, y, [0, -1])) {
      return [0, -1];
    }
    if (Random.Int(3) === 0 && Maze.checkValidMove(maze, x, y, [1, 0])) {
      return [1, 0];
    }
    if (Random.Int(2) === 0 && Maze.checkValidMove(maze, x, y, [0, 1])) {
      return [0, 1];
    }
    if (Maze.checkValidMove(maze, x, y, [-1, 0])) {
      return [-1, 0];
    }
    return null;
  }

  private static checkValidMove(maze: boolean[][], x: number, y: number, mov: number[]): boolean {
    const sideX = 1 - Math.abs(mov[0]!);
    const sideY = 1 - Math.abs(mov[1]!);

    x += mov[0]!;
    y += mov[1]!;

    if (x <= 0 || x >= maze.length - 1 || y <= 0 || y >= maze[0]!.length - 1) {
      return false;
    }
    if (maze[x]![y] || maze[x + sideX]![y + sideY] || maze[x - sideX]![y - sideY]) {
      return false;
    }

    x += mov[0]!;
    y += mov[1]!;

    if (x <= 0 || x >= maze.length - 1 || y <= 0 || y >= maze[0]!.length - 1) {
      return false;
    }
    if (maze[x]![y]) {
      return false;
    }
    if (!Maze.allowDiagonals && (maze[x + sideX]![y + sideY] || maze[x - sideX]![y - sideY])) {
      return false;
    }

    return true;
  }
}
