// Port of com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor

import { EquipableItem } from '../EquipableItem';
import type { Hero } from '../../hero/Hero';

export enum ArmorAugment {
  EVASION = 'EVASION',
  DEFENSE = 'DEFENSE',
  NONE = 'NONE'
}

export abstract class Armor extends EquipableItem {
  augment: ArmorAugment = ArmorAugment.NONE;
  glyph: any = null;
  glyphHardened = false;
  curseInfusionBonus = false;
  masteryPotionBonus = false;

  abstract tier: number;

  protected usesToID = 10;
  protected usesLeftToID = 10;
  protected availableUsesToID = 5;

  DRMin(): number {
    let tier = this.tier;
    if (this.augment === ArmorAugment.DEFENSE) tier += 1;
    if (this.augment === ArmorAugment.EVASION) tier -= 2;
    return tier;
  }

  DRMax(): number {
    const tier = this.tier;
    let max = tier * 2 + this.trueLevel() * 2;
    if (this.augment === ArmorAugment.DEFENSE) max += 2;
    if (this.augment === ArmorAugment.EVASION) max -= 4;
    return Math.max(0, max);
  }

  STRReq(lvl = 0): number {
    let req = Armor.STRReq(this.tier, lvl);
    if (this.masteryPotionBonus) req -= 2;
    return req;
  }

  static STRReq(tier: number, lvl: number): number {
    return (7 + tier * 2) - Math.floor(lvl / 3);
  }

  evasionFactor(_hero: Hero): number {
    let eva = 1;
    if (this.augment === ArmorAugment.EVASION) eva += 2;
    if (this.augment === ArmorAugment.DEFENSE) eva -= 2;
    return eva;
  }

  speedFactor(_hero: Hero): number {
    let speed = 1;
    const strDiff = _hero.STR - this.STRReq();
    if (strDiff < 0) speed += strDiff * 0.04;
    return speed;
  }

  name(): string {
    return this.constructor.name;
  }

  doEquip(_hero: Hero): boolean {
    return true;
  }
}
