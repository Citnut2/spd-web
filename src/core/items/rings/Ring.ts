// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring

import { KindofMisc } from '../KindofMisc';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';
import type { Hero } from '../../hero/Hero';
import type { Char } from '../../actors/Char';
import { Buff } from '../../actors/buffs/Buff';
import { Float, Int } from '../../utils/Random';

export abstract class Ring extends KindofMisc {
  protected _ringBuff: RingBuff | null = null;
  buffClass: (new (...args: any[]) => RingBuff) | null = null;

  protected anonymous = false;

  constructor() {
    super();
    this.image = ItemSpriteSheet.RING_GARNET;
  }

  anonymize(): void {
    if (!this.isKnown()) this.image = ItemSpriteSheet.RING_HOLDER;
    this.anonymous = true;
  }

  activate(ch: Char): void {
    if (this._ringBuff) {
      this._ringBuff.detach();
      this._ringBuff = null;
    }
    const b = this.createBuff();
    if (b) {
      this._ringBuff = b;
      b.attachTo(ch);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override doEquip(_hero: Hero): boolean {
    return true;
  }

  override doUnequip(hero: Hero, _collect?: boolean, _single?: boolean): boolean {
    if (super.doUnequip(hero)) {
      if (this._ringBuff) {
        this._ringBuff.detach();
        this._ringBuff = null;
      }
      return true;
    }
    return false;
  }

  isKnown(): boolean {
    return this.anonymous;
  }

  setKnown(): void {
    // Simplified: always known
  }

  override name(): string {
    return this.isKnown() ? super.name() : `ring of ${this.constructor.name.replace('RingOf', '').toLowerCase()}`;
  }

  override isIdentified(): boolean {
    return super.isIdentified() && this.isKnown();
  }

  override identify(_byHero = false): this {
    this.setKnown();
    super.identify();
    return this;
  }

  override random(): this {
    let n = 0;
    if (Int(3) === 0) {
      n++;
      if (Int(5) === 0) n++;
    }
    this.setLevel(n);
    if (Float() < 0.3) this.cursed = true;
    return this;
  }

  override value(): number {
    let price = 75;
    if (this.cursed && this.cursedKnown) price /= 2;
    if (this.levelKnown) {
      if (this.trueLevel() > 0) price *= this.trueLevel() + 1;
      else if (this.trueLevel() < 0) price /= 1 - this.trueLevel();
    }
    return Math.max(1, price);
  }

  override buffedLvl(): number {
    return super.buffedLvl();
  }

  // For ring descriptions
  soloBonus(): number {
    if (this.cursed) {
      return Math.min(0, this.trueLevel() - 2);
    }
    return this.trueLevel() + 1;
  }

  soloBuffedBonus(): number {
    if (this.cursed) {
      return Math.min(0, this.buffedLvl() - 2);
    }
    return this.buffedLvl() + 1;
  }

  protected createBuff(): RingBuff | null {
    return null;
  }

  static getBonus(target: Char, type: new (...args: any[]) => RingBuff): number {
    let bonus = 0;
    for (const b of target.findAllBuffs(type)) {
      bonus += b.level();
    }
    return bonus;
  }

  static getBuffedBonus(target: Char, type: new (...args: any[]) => RingBuff): number {
    let bonus = 0;
    for (const b of target.findAllBuffs(type)) {
      bonus += b.buffedLvl();
    }
    return bonus;
  }
}

export class RingBuff extends Buff {
  override attachTo(target: Char): boolean {
    return super.attachTo(target);
  }

  override act(): boolean {
    this.spend(1);
    return true;
  }

  level(): number {
    return 0;
  }

  buffedLvl(): number {
    return 0;
  }
}
