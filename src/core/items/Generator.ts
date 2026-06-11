import { Item } from './Item';
import { Gold } from './Gold';
import { Dagger } from './weapon/melee/Dagger';
import { Shortsword } from './weapon/melee/Shortsword';
import { ClothArmor } from './armor/ClothArmor';
import { LeatherArmor } from './armor/LeatherArmor';
import { PotionOfHealing } from './potions/PotionOfHealing';
import { ScrollOfUpgrade } from './scrolls/ScrollOfUpgrade';
import { MysteryMeat } from './food/MysteryMeat';

export type CatInfo = {
  idx: number;
  first: number;
  second: number;
  superCls: string;
  items?: (new () => Item)[];
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Generator {
  static Category: Record<string, CatInfo> = {
    TRINKET:      { idx: 0,  first: 0,  second: 0,  superCls: 'Trinket' },
    WEAPON:       { idx: 1,  first: 2,  second: 2,  superCls: 'MeleeWeapon' },
    WEP_T1:       { idx: 2,  first: 0,  second: 0,  superCls: 'MeleeWeapon', items: [Dagger] },
    WEP_T2:       { idx: 3,  first: 0,  second: 0,  superCls: 'MeleeWeapon', items: [Shortsword] },
    WEP_T3:       { idx: 4,  first: 0,  second: 0,  superCls: 'MeleeWeapon' },
    WEP_T4:       { idx: 5,  first: 0,  second: 0,  superCls: 'MeleeWeapon' },
    WEP_T5:       { idx: 6,  first: 0,  second: 0,  superCls: 'MeleeWeapon' },
    ARMOR:        { idx: 7,  first: 2,  second: 1,  superCls: 'Armor', items: [ClothArmor, LeatherArmor] },
    MISSILE:      { idx: 8,  first: 1,  second: 2,  superCls: 'MissileWeapon' },
    MIS_T1:       { idx: 9,  first: 0,  second: 0,  superCls: 'MissileWeapon' },
    MIS_T2:       { idx: 10, first: 0,  second: 0,  superCls: 'MissileWeapon' },
    MIS_T3:       { idx: 11, first: 0,  second: 0,  superCls: 'MissileWeapon' },
    MIS_T4:       { idx: 12, first: 0,  second: 0,  superCls: 'MissileWeapon' },
    MIS_T5:       { idx: 13, first: 0,  second: 0,  superCls: 'MissileWeapon' },
    WAND:         { idx: 14, first: 1,  second: 1,  superCls: 'Wand' },
    RING:         { idx: 15, first: 1,  second: 0,  superCls: 'Ring' },
    ARTIFACT:     { idx: 16, first: 0,  second: 1,  superCls: 'Artifact' },
    FOOD:         { idx: 17, first: 0,  second: 0,  superCls: 'Food', items: [MysteryMeat] },
    POTION:       { idx: 18, first: 8,  second: 8,  superCls: 'Potion', items: [PotionOfHealing] },
    SEED:         { idx: 19, first: 1,  second: 1,  superCls: 'Plant$Seed' },
    SCROLL:       { idx: 20, first: 8,  second: 8,  superCls: 'Scroll', items: [ScrollOfUpgrade] },
    STONE:        { idx: 21, first: 1,  second: 1,  superCls: 'Runestone' },
    GOLD:         { idx: 22, first: 10, second: 10, superCls: 'Gold', items: [Gold] },
  };

  static floorSetTierProbs = [
    [0, 75, 20, 4, 1],
    [0, 25, 50, 20, 5],
    [0, 0, 40, 50, 10],
    [0, 0, 20, 40, 40],
    [0, 0, 0, 20, 80],
  ];

  static wepTiers = ['WEP_T1', 'WEP_T2', 'WEP_T3', 'WEP_T4', 'WEP_T5'];
  static misTiers = ['MIS_T1', 'MIS_T2', 'MIS_T3', 'MIS_T4', 'MIS_T5'];

  static fullReset(): void {
    // stub
  }

  static generalReset(): void {
    // stub
  }

  static random(category: CatInfo | undefined): Item | null {
    if (!category) return null;
    const items = category.items;
    if (items && items.length > 0) {
      const idx = Math.floor(Math.random() * items.length);
      const ctor = items[idx];
      if (ctor) {
        return new ctor();
      }
    }
    return null;
  }

  static randomUsingDefaults(category: CatInfo | undefined): Item | null {
    return Generator.random(category);
  }

  static randomArmor(): Item | null {
    return Generator.random(Generator.Category.ARMOR);
  }
}
