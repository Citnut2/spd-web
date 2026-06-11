// Port of com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero
import { Char, Alignment } from '../actors/Char';
import { Actor } from '../actors/Actor';
import { IntRange } from '../utils/Random';
import { GLog } from '../../ui/GLog';
import { Belongings } from './Belongings';

export enum HeroClass {
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  ROGUE = 'ROGUE',
  HUNTRESS = 'HUNTRESS',
  DUELIST = 'DUELIST',
  CLERIC = 'CLERIC'
}

const HERO_STATS: Record<HeroClass, { HT: number; STR: number }> = {
  [HeroClass.WARRIOR]:  { HT: 20, STR: 11 },
  [HeroClass.MAGE]:     { HT: 15, STR: 8  },
  [HeroClass.ROGUE]:    { HT: 17, STR: 10 },
  [HeroClass.HUNTRESS]: { HT: 18, STR: 9  },
  [HeroClass.DUELIST]:  { HT: 19, STR: 11 },
  [HeroClass.CLERIC]:   { HT: 16, STR: 10 },
};

export class Hero extends Char {
  heroClass: HeroClass;
  lvl = 1;
  exp = 0;
  maxExp = 10;
  gold = 0;

  belongings: Belongings;
  resting = false;

  priority = Actor.HERO_PRIO;

  constructor(heroClass: HeroClass = HeroClass.WARRIOR) {
    super();
    this.heroClass = heroClass;
    this.alignment = Alignment.ALLY;
    const stats = HERO_STATS[heroClass];
    this.HT = stats.HT;
    this.HP = stats.HT;
    this.STR = stats.STR;
    this.belongings = new Belongings(this);
  }

  act(): boolean {
    // Hero waits for input by default — doesn't spend time
    // InputHandler will call moveTo/attack to trigger actions
    return false;
  }

  /** Gain XP and check for level up */
  gainExp(amount: number): void {
    this.exp += amount;
    while (this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.lvl++;
      this.maxExp = Math.floor(this.maxExp * 1.25) + 1;
      this.HT += 1;
      this.HP = this.HT; // full heal on level up
      GLog.add(`@@Level up! You are now level ${this.lvl}`);
    }
  }

  damageRoll(): number {
    return IntRange(1, 6);
  }

  interrupt(): void {
    this.resting = false;
  }

  isStarving(): boolean {
    return false;
  }
}
