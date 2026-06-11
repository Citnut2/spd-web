// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand

import { Item } from '../Item';
import type { Hero } from '../../hero/Hero';
import type { Char } from '../../actors/Char';
import { Ballistica } from '../../mechanics/Ballistica';
import { Buff } from '../../actors/buffs/Buff';
import { Float, Int } from '../../utils/Random';

export abstract class Wand extends Item {
  static readonly AC_ZAP = 'ZAP';

  maxCharges = this.initialCharges();
  curCharges = this.maxCharges;
  partialCharge = 0;

  protected charger: Charger | null = null;
  curChargeKnown = false;

  curseInfusionBonus = false;
  resinBonus = 0;

  protected collisionProperties = Ballistica.MAGIC_BOLT;

  constructor() {
    super();
    this.defaultAction = Wand.AC_ZAP;
    this.usesTargeting = true;
    this.bones = true;
  }

  override actions(hero: Hero): string[] {
    const acts = super.actions(hero);
    if (this.curCharges > 0 || !this.curChargeKnown) {
      acts.push(Wand.AC_ZAP);
    }
    return acts;
  }

  override execute(hero: Hero, action: string): void {
    super.execute(hero, action);
    if (action === Wand.AC_ZAP) {
      // Simplified: no cell selector; subclasses handle targeting
    }
  }

  override targetingPos(user: Hero, dst: number): number {
    if (this.cursed && this.cursedKnown) {
      return new Ballistica(user.pos, dst, Ballistica.MAGIC_BOLT).collisionPos;
    }
    return new Ballistica(user.pos, dst, this.collisionProperties).collisionPos;
  }

  abstract onZap(attack: Ballistica): void;
  abstract onHit(staff: any, attacker: Char, defender: Char, damage: number): void;

  tryToZap(_owner: Hero, _target: number): boolean {
    return this.curCharges >= this.chargesPerCast();
  }

  override collect(container: import('../Bag').Bag): boolean {
    if (super.collect(container)) {
      if (container.owner) {
        this.charge(container.owner);
      }
      return true;
    }
    return false;
  }

  gainCharge(amt: number, overcharge = false): void {
    this.partialCharge += amt;
    while (this.partialCharge >= 1) {
      if (overcharge) {
        this.curCharges = Math.min(this.maxCharges + Math.floor(amt), this.curCharges + 1);
      } else {
        this.curCharges = Math.min(this.maxCharges, this.curCharges + 1);
      }
      this.partialCharge--;
    }
  }

  charge(owner: Char): void {
    if (!this.charger) this.charger = new Charger(this);
    this.charger.attachTo(owner);
  }

  chargeWithFactor(owner: Char, _scaleFactor: number): void {
    this.charge(owner);
  }

  stopCharging(): void {
    if (this.charger) {
      this.charger.detach();
      this.charger = null;
    }
  }

  override onDetach(): void {
    this.stopCharging();
  }

  setLevel(value: number): void {
    super.setLevel(value);
    this.updateLevel();
  }

  override identify(_byHero = false): this {
    this.curChargeKnown = true;
    super.identify();
    return this;
  }

  override isIdentified(): boolean {
    return super.isIdentified() && this.curChargeKnown;
  }

  override status(): string | null {
    if (this.levelKnown) {
      return `${this.curChargeKnown ? this.curCharges : '?'}/${this.maxCharges}`;
    }
    return null;
  }

  override upgrade(amount = 1): this {
    super.upgrade(amount);
    if (Int(3) === 0) this.cursed = false;
    if (this.resinBonus > 0) this.resinBonus--;
    this.updateLevel();
    this.curCharges = Math.min(this.curCharges + 1, this.maxCharges);
    return this;
  }

  override degrade(amount = 1): this {
    super.degrade(amount);
    this.updateLevel();
    return this;
  }

  override buffedLvl(): number {
    return super.buffedLvl();
  }

  updateLevel(): void {
    this.maxCharges = Math.min(this.initialCharges() + this.trueLevel(), 10);
    this.curCharges = Math.min(this.curCharges, this.maxCharges);
  }

  initialCharges(): number {
    return 2;
  }

  protected chargesPerCast(): number {
    return 1;
  }

  fx(_bolt: Ballistica, callback: () => void): void {
    callback();
  }

  staffFx(_particle: any): void {
    // override in subclasses
  }

  wandUsed(): void {
    this.curCharges -= this.cursed ? 1 : this.chargesPerCast();
  }

  protected wandProc(_target: Char, _chargesUsed: number): void {
    // override in subclasses with talent-specific logic
  }

  override random(): this {
    let n = 0;
    if (Int(3) === 0) {
      n++;
      if (Int(5) === 0) n++;
    }
    this.setLevel(n);
    this.curCharges += n;
    if (Float() < 0.3) this.cursed = true;
    return this;
  }

  override glowing(): any {
    if (this.resinBonus <= 0) return null;
    return { color: 0xFFFFFF, period: 1 / this.resinBonus };
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

  collisionPropertiesForTarget(_target: number): number {
    return this.cursed ? Ballistica.MAGIC_BOLT : this.collisionProperties;
  }
}

export class Charger extends Buff {
  private _wand: Wand;
  private static readonly BASE_CHARGE_DELAY = 10;
  private static readonly SCALING_CHARGE_ADDITION = 40;
  private static readonly NORMAL_SCALE_FACTOR = 0.875;

  scalingFactor = Charger.NORMAL_SCALE_FACTOR;

  constructor(wand: Wand) {
    super();
    this._wand = wand;
  }

  wand(): Wand {
    return this._wand;
  }

  override attachTo(target: Char): boolean {
    return super.attachTo(target);
  }

  override act(): boolean {
    if (this._wand.curCharges < this._wand.maxCharges) {
      this.recharge();
    }
    while (this._wand.partialCharge >= 1 && this._wand.curCharges < this._wand.maxCharges) {
      this._wand.partialCharge--;
      this._wand.curCharges++;
    }
    if (this._wand.curCharges === this._wand.maxCharges) {
      this._wand.partialCharge = 0;
    }
    this.spend(1);
    return true;
  }

  private recharge(): void {
    const missing = Math.max(0, this._wand.maxCharges - this._wand.curCharges);
    const turns = Charger.BASE_CHARGE_DELAY
      + Charger.SCALING_CHARGE_ADDITION * Math.pow(this.scalingFactor, missing);
    this._wand.partialCharge += 1 / turns;
  }

  gainCharge(charge: number): void {
    if (this._wand.curCharges < this._wand.maxCharges) {
      this._wand.partialCharge += charge;
      while (this._wand.partialCharge >= 1) {
        this._wand.curCharges++;
        this._wand.partialCharge--;
      }
      if (this._wand.curCharges >= this._wand.maxCharges) {
        this._wand.partialCharge = 0;
        this._wand.curCharges = this._wand.maxCharges;
      }
    }
  }

  setScaleFactor(value: number): void {
    this.scalingFactor = value;
  }
}
