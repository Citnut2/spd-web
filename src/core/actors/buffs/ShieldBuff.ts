// Port of com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff

import { Buff } from './Buff';
import type { Char } from '../Char';

export abstract class ShieldBuff extends Buff {
  private _shielding = 0;

  protected shieldUsePriority = 0;
  protected detachesAtZero = true;

  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.needsShieldUpdate = true;
      return true;
    }
    return false;
  }

  detach(): void {
    if (this.target) this.target.needsShieldUpdate = true;
    super.detach();
  }

  shielding(): number {
    return this._shielding;
  }

  setShield(shield: number): void {
    if (this._shielding <= shield) this._shielding = shield;
    if (this.target) this.target.needsShieldUpdate = true;
  }

  incShield(amt = 1): void {
    this._shielding += amt;
    if (this.target) this.target.needsShieldUpdate = true;
  }

  decShield(amt = 1): void {
    this._shielding -= amt;
    if (this.target) this.target.needsShieldUpdate = true;
  }

  delay(value: number): void {
    this.spend(value);
  }

  absorbDamage(dmg: number): number {
    if (this._shielding >= dmg) {
      this._shielding -= dmg;
      dmg = 0;
    } else {
      dmg -= this._shielding;
      this._shielding = 0;
    }
    if (this._shielding <= 0 && this.detachesAtZero) {
      this.detach();
    }
    if (this.target) this.target.needsShieldUpdate = true;
    return dmg;
  }

  static processDamage(target: Char, damage: number, _src?: any): number {
    const buffs = target.findAllBuffs(ShieldBuff as unknown as new (...args: any[]) => ShieldBuff);
    if (buffs.length > 0) {
      buffs.sort((a, b) => b.shieldUsePriority - a.shieldUsePriority);
      for (const buff of buffs) {
        if (buff.shielding() <= 0) continue;
        damage = buff.absorbDamage(damage);
        if (damage === 0) break;
      }
    }
    return damage;
  }
}
