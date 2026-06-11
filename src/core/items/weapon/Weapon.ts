// Port of com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon

import { KindOfWeapon } from '../KindOfWeapon';
import type { Hero } from '../../hero/Hero';

export enum WeaponAugment {
  SPEED = 'SPEED',
  DAMAGE = 'DAMAGE',
  NONE = 'NONE'
}

export abstract class Weapon extends KindOfWeapon {
  ACC = 1;
  DLY = 1;
  RCH = 1;

  augment: WeaponAugment = WeaponAugment.NONE;

  enchantment: any = null;
  enchantHardened = false;
  curseInfusionBonus = false;
  masteryPotionBonus = false;

  protected usesToID = 20;
  protected usesLeftToID = 20;
  protected availableUsesToID = 10;

  abstract min(lvl: number): number;
  abstract max(lvl: number): number;
  abstract get weaponTier(): number;
  abstract set weaponTier(v: number);

  damageRoll(_owner: Hero): number {
    return 0;
  }

  accuracyFactor(_owner: Hero): number {
    let acc = this.ACC;
    if (this.augment === WeaponAugment.DAMAGE) acc *= 1.5;
    if (this.augment === WeaponAugment.SPEED) acc *= 0.7;
    return acc;
  }

  delayFactor(_owner: Hero): number {
    let dly = this.DLY;
    if (this.augment === WeaponAugment.DAMAGE) dly *= 5 / 3;
    if (this.augment === WeaponAugment.SPEED) dly *= 2 / 3;
    return dly;
  }

  reachFactor(_owner: Hero): number {
    return this.RCH;
  }

  defenseFactor(_owner: Hero): number {
    return 0;
  }

  STRReq(lvl = 0): number {
    return Weapon.STRReq(this.tier(), lvl);
  }

  static STRReq(tier: number, lvl: number): number {
    return (8 + tier * 2) - Math.floor(lvl / 3);
  }

  tier(): number {
    return 1;
  }
}
