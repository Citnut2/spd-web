// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion

import { Ring, RingBuff } from './Ring';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';
import type { Char } from '../../actors/Char';

export class RingOfEvasion extends Ring {
  constructor() {
    super();
    this.icon = ItemSpriteSheet.Icons.RING_EVASION;
    this.buffClass = Evasion;
  }

  override soloBonus(): number {
    if (this.cursed) return Math.min(0, this.trueLevel() - 2);
    return this.trueLevel() + 1;
  }

  override soloBuffedBonus(): number {
    if (this.cursed) return Math.min(0, this.buffedLvl() - 2);
    return this.buffedLvl() + 1;
  }

  override createBuff(): RingBuff {
    return new Evasion();
  }

  static evasionMultiplier(target: Char): number {
    return Math.pow(1.125, Ring.getBuffedBonus(target, Evasion));
  }
}

export class Evasion extends RingBuff {
  override level(): number {
    return 0;
  }

  override buffedLvl(): number {
    return 0;
  }
}
