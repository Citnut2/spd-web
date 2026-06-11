// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact

import { KindofMisc } from '../KindofMisc';
import type { Hero } from '../../hero/Hero';
import type { Char } from '../../actors/Char';
import { Buff } from '../../actors/buffs/Buff';
import { Float } from '../../utils/Random';

export class Artifact extends KindofMisc {
  protected _passiveBuff: ArtifactBuff | null = null;
  protected activeBuff: ArtifactBuff | null = null;

  protected exp = 0;
  protected levelCap = 0;

  protected _charge = 0;
  protected partialCharge = 0;
  protected chargeCap = 0;

  protected cooldown = 0;

  override doEquip(hero: Hero): boolean {
    if ((hero.belongings.artifact && hero.belongings.artifact.constructor === this.constructor)
        || (hero.belongings.misc && hero.belongings.misc.constructor === this.constructor)) {
      return false;
    }
    this.identify();
    return true;
  }

  activate(ch: Char): void {
    if (this._passiveBuff) {
      if (this._passiveBuff.target) this._passiveBuff.detach();
      this._passiveBuff = null;
    }
    const b = this.createPassiveBuff();
    if (b) {
      this._passiveBuff = b;
      b.attachTo(ch);
    }
  }

  override doUnequip(hero: Hero, _collect?: boolean, _single?: boolean): boolean {
    if (super.doUnequip(hero)) {
      if (this._passiveBuff) {
        if (this._passiveBuff.target) this._passiveBuff.detach();
        this._passiveBuff = null;
      }
      return true;
    }
    return false;
  }

  override isUpgradable(): boolean {
    return false;
  }

  override visiblyUpgraded(): number {
    return this.levelKnown ? Math.round((this.trueLevel() * 10) / Math.max(1, this.levelCap)) : 0;
  }

  override buffedLvl(): number {
    return this.trueLevel();
  }

  transferUpgrade(transferLvl: number): void {
    this.upgrade(Math.round((transferLvl * this.levelCap) / 10));
  }

  override status(): string | null {
    if (!this.isIdentified() || this.cursed) return null;
    if (this.cooldown !== 0) return String(this.cooldown);
    if (this.chargeCap === 100) return `${this._charge}%`;
    if (this.chargeCap > 0) return `${this._charge}/${this.chargeCap}`;
    if (this._charge !== 0) return String(this._charge);
    return null;
  }

  override random(): this {
    if (Float() < 0.3) this.cursed = true;
    return this;
  }

  override value(): number {
    let price = 100;
    if (this.trueLevel() > 0) price += 20 * this.visiblyUpgraded();
    if (this.cursed && this.cursedKnown) price /= 2;
    return Math.max(1, price);
  }

  protected createPassiveBuff(): ArtifactBuff | null {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  charge(_target: Hero, _amount: number): void {
    // override in subclasses
  }
}

export class ArtifactBuff extends Buff {
  override attachTo(target: Char): boolean {
    return super.attachTo(target);
  }

  itemLevel(): number {
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  charge(_target: Hero, _amount: number): void {
    // override in subclasses
  }
}
