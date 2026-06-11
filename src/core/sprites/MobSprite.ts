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

// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite

import { CharSprite } from './CharSprite';
import { Mob, MobState } from '../actors/mobs/Mob';

export class MobSprite extends CharSprite {
  private static readonly FADE_TIME = 3;

  constructor() {
    super();
  }

  place(cell: number, mapWidth: number): void {
    super.place(cell, mapWidth);
  }

  updateSprite(mapWidth?: number): void {
    if (!this.ch) return;
    if (this.ch instanceof Mob) {
      this.sleeping = this.ch.isAlive() && (this.ch as Mob).state === MobState.SLEEPING;
    }
    this.place(this.ch.pos, mapWidth ?? this.mapWidth);
  }

  /** Override to add fade-out on death animation completion */
  protected setupDeathFade(): void {
    const origComplete = this.animCallback;
    this.animCallback = () => {
      if (origComplete) origComplete();
      let elapsed = 0;
      const fadeStep = () => {
        elapsed += 0.016;
        const alpha = Math.max(0, 1 - elapsed / MobSprite.FADE_TIME);
        this.alpha = alpha;
        if (alpha <= 0) {
          this.killAndErase();
        } else {
          requestAnimationFrame(fadeStep);
        }
      };
      fadeStep();
    };
  }

  killAndErase(): void {
    if (this.parent) {
      this.removeFromParent();
    }
    this.destroy();
  }
}
