import { Buff, BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Char } from '../Char';
import { Hero } from '../../hero/Hero';
import { Chill } from './Chill';
import { Burning } from './Burning';
import { Dungeon } from '../../levels/Dungeon';

export class Frost extends FlavourBuff {
  static readonly DURATION = 10;

  constructor() {
    super();
    this.type = BuffType.NEGATIVE;
    this.announced = true;
    this._immunities.add(Chill);
  }

  override attachTo(target: Char): boolean {
    Buff.detach(target, Burning);

    if (super.attachTo(target)) {
      target.paralysed++;
      Buff.detach(target, Chill);

      if (target instanceof Hero) {
        const hero = target as Hero;
        if (!hero.belongings.lostInventory()) {
          for (const item of hero.belongings.backpack.items) {
            if (!item.unique) {
              item.detach(hero.belongings.backpack);
              break;
            }
          }
        }
      }

      return true;
    }
    return false;
  }

  override detach(): void {
    super.detach();
    if (this.target!.paralysed > 0) {
      this.target!.paralysed--;
    }
    if (Dungeon.level.water[this.target!.pos]) {
      Buff.prolong(this.target!, Chill, Chill.DURATION / 2);
    }
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Frost.DURATION - this.visualCooldown()) / Frost.DURATION);
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}
