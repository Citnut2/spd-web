import { Item } from './Item';
import { Gold } from './Gold';
import { Dagger } from './weapon/melee/Dagger';
import { Shortsword } from './weapon/melee/Shortsword';
import { WornShortsword } from './weapon/melee/WornShortsword';
import { ClothArmor } from './armor/ClothArmor';
import { LeatherArmor } from './armor/LeatherArmor';
import { PotionOfHealing } from './potions/PotionOfHealing';
import { PotionOfStrength } from './potions/PotionOfStrength';
import { PotionOfMindVision } from './potions/PotionOfMindVision';
import { PotionOfFrost } from './potions/PotionOfFrost';
import { PotionOfLiquidFlame } from './potions/PotionOfLiquidFlame';
import { PotionOfToxicGas } from './potions/PotionOfToxicGas';
import { PotionOfHaste } from './potions/PotionOfHaste';
import { PotionOfInvisibility } from './potions/PotionOfInvisibility';
import { PotionOfLevitation } from './potions/PotionOfLevitation';
import { PotionOfParalyticGas } from './potions/PotionOfParalyticGas';
import { PotionOfPurity } from './potions/PotionOfPurity';
import { PotionOfExperience } from './potions/PotionOfExperience';
import { ScrollOfUpgrade } from './scrolls/ScrollOfUpgrade';
import { ScrollOfIdentify } from './scrolls/ScrollOfIdentify';
import { ScrollOfRemoveCurse } from './scrolls/ScrollOfRemoveCurse';
import { ScrollOfTeleportation } from './scrolls/ScrollOfTeleportation';
import { ScrollOfMagicMapping } from './scrolls/ScrollOfMagicMapping';
import { ScrollOfRage } from './scrolls/ScrollOfRage';
import { ScrollOfTerror } from './scrolls/ScrollOfTerror';
import { ScrollOfLullaby } from './scrolls/ScrollOfLullaby';
import { ScrollOfRetribution } from './scrolls/ScrollOfRetribution';
import { ScrollOfMirrorImage } from './scrolls/ScrollOfMirrorImage';
import { ScrollOfRecharging } from './scrolls/ScrollOfRecharging';
import { ScrollOfTransmutation } from './scrolls/ScrollOfTransmutation';
import { WandOfMagicMissile } from './wands/WandOfMagicMissile';
import { RingOfAccuracy } from './rings/RingOfAccuracy';
import { RingOfEvasion } from './rings/RingOfEvasion';
import { MysteryMeat } from './food/MysteryMeat';
import { Dungeon } from '../levels/Dungeon';
import * as Random from '../utils/Random';

type ItemCtor = new () => Item;

export class Cat {
  classes: ItemCtor[] = [];
  probs: number[] = [];
  defaultProbs: number[] | null = null;
  defaultProbs2: number[] | null = null;
  using2ndProbs = false;
  defaultProbsTotal: number[] | null = null;
  seed: number | null = null;
  dropped = 0;
  firstProb: number;
  secondProb: number;

  constructor(first: number, second: number) {
    this.firstProb = first;
    this.secondProb = second;
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Generator {
  private static allCats: Cat[] = [];

  static readonly TRINKET  = new Cat(0, 0);
  static readonly WEAPON   = new Cat(2, 2);
  static readonly WEP_T1   = new Cat(0, 0);
  static readonly WEP_T2   = new Cat(0, 0);
  static readonly WEP_T3   = new Cat(0, 0);
  static readonly WEP_T4   = new Cat(0, 0);
  static readonly WEP_T5   = new Cat(0, 0);
  static readonly ARMOR    = new Cat(2, 1);
  static readonly MISSILE  = new Cat(1, 2);
  static readonly MIS_T1   = new Cat(0, 0);
  static readonly MIS_T2   = new Cat(0, 0);
  static readonly MIS_T3   = new Cat(0, 0);
  static readonly MIS_T4   = new Cat(0, 0);
  static readonly MIS_T5   = new Cat(0, 0);
  static readonly WAND     = new Cat(1, 1);
  static readonly RING     = new Cat(1, 0);
  static readonly ARTIFACT = new Cat(0, 1);
  static readonly FOOD     = new Cat(0, 0);
  static readonly POTION   = new Cat(8, 8);
  static readonly SEED     = new Cat(1, 1);
  static readonly SCROLL   = new Cat(8, 8);
  static readonly STONE    = new Cat(1, 1);
  static readonly GOLD     = new Cat(10, 10);

  static floorSetTierProbs: number[][] = [];
  static wepTiers: Cat[] = [];
  static misTiers: Cat[] = [];

  private static usingFirstDeck = false;
  private static catProbs: Map<Cat, number> = new Map();
  private static defaultCatProbs: Map<Cat, number> = new Map();

  static init(): void {
    Generator.allCats = [
      Generator.TRINKET, Generator.WEAPON,
      Generator.WEP_T1, Generator.WEP_T2, Generator.WEP_T3, Generator.WEP_T4, Generator.WEP_T5,
      Generator.ARMOR, Generator.MISSILE,
      Generator.MIS_T1, Generator.MIS_T2, Generator.MIS_T3, Generator.MIS_T4, Generator.MIS_T5,
      Generator.WAND, Generator.RING, Generator.ARTIFACT,
      Generator.FOOD, Generator.POTION, Generator.SEED, Generator.SCROLL, Generator.STONE,
      Generator.GOLD,
    ];

    const PC = Generator.POTION;
    PC.classes = [
      PotionOfStrength, PotionOfHealing, PotionOfMindVision,
      PotionOfFrost, PotionOfLiquidFlame, PotionOfToxicGas,
      PotionOfHaste, PotionOfInvisibility, PotionOfLevitation,
      PotionOfParalyticGas, PotionOfPurity, PotionOfExperience,
    ];
    PC.defaultProbs  = [0, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1];
    PC.defaultProbs2 = [0, 3, 2, 2, 1, 2, 1, 1, 1, 1, 1, 0];
    PC.probs = [...PC.defaultProbs];

    const SC = Generator.SCROLL;
    SC.classes = [
      ScrollOfUpgrade, ScrollOfIdentify, ScrollOfRemoveCurse,
      ScrollOfMirrorImage, ScrollOfRecharging, ScrollOfTeleportation,
      ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfRage,
      ScrollOfRetribution, ScrollOfTerror, ScrollOfTransmutation,
    ];
    SC.defaultProbs  = [0, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1];
    SC.defaultProbs2 = [0, 3, 2, 2, 1, 2, 1, 1, 1, 1, 1, 0];
    SC.probs = [...SC.defaultProbs];

    const WC = Generator.WAND;
    WC.classes = [WandOfMagicMissile];
    WC.defaultProbs = [3];
    WC.probs = [...WC.defaultProbs];

    const RC = Generator.RING;
    RC.classes = [RingOfAccuracy, RingOfEvasion];
    RC.defaultProbs = [3, 3];
    RC.probs = [...RC.defaultProbs];

    Generator.ARMOR.classes = [ClothArmor, LeatherArmor];
    Generator.ARMOR.probs = [1, 1];

    Generator.FOOD.classes = [MysteryMeat];
    Generator.FOOD.defaultProbs = [1];
    Generator.FOOD.probs = [...Generator.FOOD.defaultProbs];

    Generator.GOLD.classes = [Gold];
    Generator.GOLD.probs = [1];

    Generator.WEP_T1.classes = [WornShortsword, Dagger];
    Generator.WEP_T1.defaultProbs = [2, 2];
    Generator.WEP_T1.probs = [...Generator.WEP_T1.defaultProbs];

    Generator.WEP_T2.classes = [Shortsword];
    Generator.WEP_T2.defaultProbs = [2];
    Generator.WEP_T2.probs = [...Generator.WEP_T2.defaultProbs];

    Generator.wepTiers = [Generator.WEP_T1, Generator.WEP_T2, Generator.WEP_T3, Generator.WEP_T4, Generator.WEP_T5];
    Generator.misTiers = [Generator.MIS_T1, Generator.MIS_T2, Generator.MIS_T3, Generator.MIS_T4, Generator.MIS_T5];

    Generator.floorSetTierProbs = [
      [0, 75, 20, 4, 1],
      [0, 25, 50, 20, 5],
      [0, 0, 40, 50, 10],
      [0, 0, 20, 40, 40],
      [0, 0, 0, 20, 80],
    ];

    for (const cat of Generator.allCats) {
      if (cat.defaultProbs2 !== null) {
        cat.defaultProbsTotal = new Array(cat.defaultProbs!.length);
        for (let i = 0; i < cat.defaultProbs!.length; i++) {
          cat.defaultProbsTotal[i] = cat.defaultProbs![i]! + cat.defaultProbs2[i]!;
        }
      }
    }
  }

  static fullReset(): void {
    Generator.usingFirstDeck = Random.Int(2) === 0;
    Generator.generalReset();
    for (const cat of Generator.allCats) {
      cat.using2ndProbs = cat.defaultProbs2 !== null && Random.Int(2) === 0;
      Generator.reset(cat);
      if (cat.defaultProbs !== null) {
        cat.seed = Random.Long();
        cat.dropped = 0;
      }
    }
  }

  static generalReset(): void {
    for (const cat of Generator.allCats) {
      Generator.catProbs.set(cat, Generator.usingFirstDeck ? cat.firstProb : cat.secondProb);
      Generator.defaultCatProbs.set(cat, cat.firstProb + cat.secondProb);
    }
  }

  static reset(cat: Cat): void {
    if (cat.defaultProbs !== null) {
      if (cat.defaultProbs2 !== null) {
        cat.using2ndProbs = !cat.using2ndProbs;
        cat.probs = cat.using2ndProbs ? [...cat.defaultProbs2] : [...cat.defaultProbs];
      } else {
        cat.probs = [...cat.defaultProbs];
      }
    }
  }

  static random(): Item {
    const entries = Array.from(Generator.catProbs.entries());
    const clist = entries.map(e => e[0]);
    const probs = entries.map(e => e[1]);
    let idx = Random.chances(probs);
    if (idx === -1) {
      Generator.usingFirstDeck = !Generator.usingFirstDeck;
      Generator.generalReset();
      idx = Random.chances(Array.from(Generator.catProbs.values()));
    }
    const chosenCat = clist[idx >= 0 ? idx : 0]!;
    Generator.catProbs.set(chosenCat, Generator.catProbs.get(chosenCat)! - 1);
    return Generator.randomFromCat(chosenCat);
  }

  static randomFromCat(cat: Cat): Item {
    let item: Item | null = null;
    if (cat === Generator.ARMOR) {
      item = Generator.randomArmor();
    } else if (cat === Generator.WEAPON) {
      item = Generator.randomWeapon();
    } else if (cat === Generator.MISSILE) {
      item = Generator.randomMissile();
    } else if (cat === Generator.ARTIFACT) {
      item = Generator.randomArtifact();
    } else if (cat.defaultProbs !== null) {
      if (cat.seed !== null) {
        Random.pushGenerator(cat.seed);
        for (let i = 0; i < cat.dropped; i++) Random.Long();
      }
      let i = Random.chances(cat.probs);
      if (i === -1) {
        Generator.reset(cat);
        i = Random.chances(cat.probs);
      }
      if (i >= 0 && i < cat.classes.length) {
        cat.probs[i]!--;
        item = new (cat.classes[i]!)();
      }
      if (cat.seed !== null) {
        Random.popGenerator();
        cat.dropped++;
      }
    } else if (cat.classes.length > 0) {
      const idx = Random.Int(cat.classes.length);
      item = new (cat.classes[idx]!)();
    }
    return item ?? new Gold();
  }

  static randomArmor(floorSet?: number): Item {
    const fs = floorSet ?? Math.min(Math.max(Math.floor(Dungeon.depth / 5), 0), Generator.floorSetTierProbs.length - 1);
    const cat = Generator.ARMOR;
    const probs = Generator.floorSetTierProbs[fs]!;
    const i = Random.chances(probs);
    const n = i >= 0 && i < cat.classes.length ? i : 0;
    return new (cat.classes[n]!)();
  }

  static randomWeapon(floorSet?: number): Item {
    const fs = floorSet ?? Math.min(Math.max(Math.floor(Dungeon.depth / 5), 0), Generator.floorSetTierProbs.length - 1);
    const probs = Generator.floorSetTierProbs[fs]!;
    const tierIdx = Random.chances(probs);
    const n = tierIdx >= 0 && tierIdx < Generator.wepTiers.length ? tierIdx : 0;
    return Generator.randomFromCat(Generator.wepTiers[n]!);
  }

  static randomMissile(floorSet?: number): Item {
    const fs = floorSet ?? Math.min(Math.max(Math.floor(Dungeon.depth / 5), 0), Generator.floorSetTierProbs.length - 1);
    const probs = Generator.floorSetTierProbs[fs]!;
    const tierIdx = Random.chances(probs);
    const n = tierIdx >= 0 && tierIdx < Generator.misTiers.length ? tierIdx : 0;
    return Generator.randomFromCat(Generator.misTiers[n]!);
  }

  static randomArtifact(): Item | null {
    const cat = Generator.ARTIFACT;
    if (cat.defaultProbs !== null && cat.seed !== null) {
      Random.pushGenerator(cat.seed);
      for (let i = 0; i < cat.dropped; i++) Random.Long();
    }
    let i = Random.chances(cat.probs);
    if (cat.defaultProbs !== null && cat.seed !== null) {
      Random.popGenerator();
      cat.dropped++;
    }
    if (i === -1) return null;
    cat.probs[i]!--;
    return new (cat.classes[i]!)();
  }

  static removeArtifact(artifactCls: ItemCtor): boolean {
    const cat = Generator.ARTIFACT;
    for (let i = 0; i < cat.classes.length; i++) {
      if (cat.classes[i]! === artifactCls && cat.probs[i]! > 0) {
        cat.probs[i] = 0;
        return true;
      }
    }
    return false;
  }

  static randomUsingDefaults(): Item {
    const entries = Array.from(Generator.defaultCatProbs.entries());
    const clist = entries.map(e => e[0]);
    const probs = entries.map(e => e[1]);
    const idx = Random.chances(probs);
    return Generator.randomFromCat(clist[idx >= 0 ? idx : 0]!);
  }
}
