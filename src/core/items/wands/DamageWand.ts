// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand

import { Wand } from './Wand';
import { Float } from '../../utils/Random';

export abstract class DamageWand extends Wand {
  abstract min(lvl: number): number;
  abstract max(lvl: number): number;

  minForLevel(): number {
    return this.min(this.buffedLvl());
  }

  maxForLevel(): number {
    return this.max(this.buffedLvl());
  }

  damageRoll(): number {
    return this.damageRollForLevel(this.buffedLvl());
  }

  damageRollForLevel(lvl: number): number {
    const mn = this.min(lvl);
    const mx = this.max(lvl);
    return Math.floor(Float() * (mx - mn + 1)) + mn;
  }

  statsDesc(): string {
    return `${this.minForLevel()}-${this.maxForLevel()}`;
  }
}
