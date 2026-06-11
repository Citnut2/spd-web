// Port of com.watabou.noosa.Game
// Turn-based game loop with actor scheduling

import type { Actor } from '../actors/Actor';
import { ActorQueue } from '../actors/ActorQueue';
import type { Char } from '../actors/Char';

export class Game {
  static instance: Game;

  // Time constants (matching Java Actor)
  static readonly TICK = 1.0;

  now = 0;
  elapsed = 0;
  timeScale = 1;

  private queue = new ActorQueue();
  private processing = false;

  constructor() {
    Game.instance = this;
  }

  add(actor: Actor): void {
    this.queue.add(actor);
    // If this is a Char, also add all its buffs
    if ('buffs' in actor) {
      const ch = actor as Char;
      for (const buff of ch.buffs) {
        this.add(buff);
      }
    }
  }

  remove(actor: Actor): void {
    this.queue.remove(actor);
    // If this is a Char, also remove all its buffs
    if ('buffs' in actor) {
      const ch = actor as Char;
      for (const buff of ch.buffs) {
        this.remove(buff);
      }
    }
  }

  /** Check if the queue contains an actor */
  contains(actor: Actor): boolean {
    return this.queue.contains(actor);
  }

  /** Process one turn — peek lowest-time actor and let it act */
  processTurn(): boolean {
    if (this.processing) return false;
    this.processing = true;

    const actor = this.queue.peek();
    if (!actor) {
      this.processing = false;
      return false;
    }

    // Actor acts — if it spends time, advance `now`
    if (actor.act()) {
      // Actor spent time; advance game time
      this.now = actor.time;
    } else {
      // Actor didn't spend time (e.g., waiting for input) — remove from queue
      this.queue.remove(actor);
    }

    this.processing = false;
    return true;
  }

  /** Process until a certain time value */
  processUntil(time: number): void {
    this.processing = true;
    while (this.queue.size > 0) {
      const actor = this.queue.peek();
      if (!actor || actor.time > time) break;
      actor.act();
    }
    this.processing = false;
  }

  /** Process a fixed number of turns */
  processTurns(count: number): void {
    for (let i = 0; i < count; i++) {
      if (!this.processTurn()) break;
    }
  }

  get queueSize(): number {
    return this.queue.size;
  }

  /** Clear all actors */
  clear(): void {
    this.queue.clear();
  }
}
