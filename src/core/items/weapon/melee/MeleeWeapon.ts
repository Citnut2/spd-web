// Port of com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon

import { Weapon } from '../Weapon';
import type { Hero } from '../../../hero/Hero';
import { IntRange } from '../../../utils/Random';

export abstract class MeleeWeapon extends Weapon {
  protected _tier = 1;

  get weaponTier(): number {
    return this._tier;
  }

  set weaponTier(v: number) {
    this._tier = v;
  }

  min(lvl: number): number {
    return this._tier + lvl;
  }

  max(lvl: number): number {
    return 5 * (this._tier + 1) + lvl * (this._tier + 1);
  }

  damageRoll(_owner?: Hero): number {
    const diff = this.max(this.trueLevel()) - this.min(this.trueLevel());
    return this.min(this.trueLevel()) + IntRange(0, diff);
  }

  STRReq(lvl = 0): number {
    let req = Weapon.STRReq(this._tier, lvl);
    if (this.masteryPotionBonus) req -= 2;
    return req;
  }

  tier(): number {
    return this._tier;
  }

  name(): string {
    return this.constructor.name;
  }

  doEquip(_hero: Hero): boolean {
    return true;
  }
}
