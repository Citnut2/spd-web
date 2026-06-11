// Port of com.shatteredpixel.shatteredpixeldungeon.actors.Actor

import { Game } from '../engine/Game';

export abstract class Actor {
  // Priority constants matching Java
  static readonly VFX_PRIO = 100;
  static readonly HERO_PRIO = 0;
  static readonly MOB_PRIO = -20;
  static readonly BUFF_PRIO = -30;

  protected static nextID = 1;

  // Schedule values (matching Java Actor)
  static readonly TIME_TO_MOVE = 1.0;
  static readonly TICK = 1.0;

  id: number;
  time = 0;
  priority = 0;
  abstract act(): boolean;

  constructor() {
    this.id = Actor.nextID++;
  }

  /** Spend game time */
  spend(time: number): void {
    this.time += time;
  }

  /** Deactivate — push time far into the future so this actor won't act */
  diactivate(): void {
    this.time = Number.MAX_VALUE;
  }

  /** Postpone — delay this actor by the given amount */
  postpone(time: number): void {
    this.spend(time);
  }

  /** Check if this actor is acting (time <= current game time) */
  get isActing(): boolean {
    return Game.instance && this.time <= Game.instance.now;
  }

  static resetNextID(): void {
    Actor.nextID = 1;
  }

  /** 8-directional neighbour calculation (mirrors Java Actor.nextPos) */
  static nextPos(currentPos: number, direction: number, levelWidth: number): number {
    switch (direction) {
      case 0:  return currentPos - levelWidth - 1; // up-left
      case 1:  return currentPos - levelWidth;     // up
      case 2:  return currentPos - levelWidth + 1; // up-right
      case 3:  return currentPos - 1;              // left
      case 4:  return currentPos + 1;              // right
      case 5:  return currentPos + levelWidth - 1; // down-left
      case 6:  return currentPos + levelWidth;     // down
      case 7:  return currentPos + levelWidth + 1; // down-right
      default: return currentPos;
    }
  }
}
