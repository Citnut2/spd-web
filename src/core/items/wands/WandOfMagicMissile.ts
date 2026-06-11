// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile

import { DamageWand } from './DamageWand';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';
import { Ballistica } from '../../mechanics/Ballistica';
import type { Char } from '../../actors/Char';
import { Buff } from '../../actors/buffs/Buff';
import { Wand, Charger } from './Wand';

export class WandOfMagicMissile extends DamageWand {
  constructor() {
    super();
    this.image = ItemSpriteSheet.WAND_MAGIC_MISSILE;
  }

  min(lvl: number): number {
    return 2 + lvl;
  }

  max(lvl: number): number {
    return 8 + 2 * lvl;
  }

  override onZap(_bolt: Ballistica): void {
    // TODO: Actor.findChar(bolt.collisionPos) when findChar is ported
    // then call this.wandProc(ch, this.chargesPerCast())
    // and ch.takeDamage(this.damageRoll(), this as any)
  }

  override onHit(_staff: any, attacker: Char, _defender: Char, _damage: number): void {
    const chargers = attacker.findAllBuffs(Charger);
    for (const c of chargers) {
      if (c.wand() !== this) {
        c.gainCharge(0.5);
      }
    }
  }

  override initialCharges(): number {
    return 3;
  }
}

export class MagicCharge extends Buff {
  static DURATION = 4;

  private _level = 0;
  private _wandJustApplied: Wand | null = null;

  override type: any = 'POSITIVE';
  override announced = true;

  setup(wand: Wand): void {
    if (this._level < wand.buffedLvl()) {
      this._level = wand.buffedLvl();
      this._wandJustApplied = wand;
    }
  }

  override detach(): void {
    super.detach();
  }

  magicLevel(): number {
    return this._level;
  }

  wandJustApplied(): Wand | null {
    const result = this._wandJustApplied;
    this._wandJustApplied = null;
    return result;
  }
}
