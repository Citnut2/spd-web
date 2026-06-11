import { Buff } from './Buff';
import { Actor } from '../Actor';
import { Hero } from '../../hero/Hero';
import { Bundle } from '../../utils/Bundle';
import { GLog } from '../../../ui/GLog';

export class Hunger extends Buff {
  static readonly HUNGRY = 300;
  static readonly STARVING = 450;

  private level = 0;
  private partialDamage = 0;

  private static readonly LEVEL = 'level';
  private static readonly PARTIALDAMAGE = 'partialDamage';

  override storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put(Hunger.LEVEL, this.level);
    bundle.put(Hunger.PARTIALDAMAGE, this.partialDamage);
  }

  override restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.level = bundle.getFloat(Hunger.LEVEL);
    this.partialDamage = bundle.getFloat(Hunger.PARTIALDAMAGE);
  }

  override act(): boolean {
    const target = this.target!;
    if (target.isAlive() && target instanceof Hero) {
      const hero = target as Hero;

      if (this.isStarving()) {
        this.partialDamage += target.HT / 1000;
        if (this.partialDamage > 1) {
          target.takeDamage(Math.floor(this.partialDamage), target);
          this.partialDamage -= Math.floor(this.partialDamage);
        }
      } else {
        const hungerDelay = 1;
        const newLevel = this.level + 1 / hungerDelay;

        if (newLevel >= Hunger.STARVING) {
          GLog.add('!!You are starving!');
          hero.takeDamage(1, target);
          hero.interrupt();
          this.level = Hunger.STARVING;
        } else if (newLevel >= Hunger.HUNGRY && this.level < Hunger.HUNGRY) {
          GLog.add('##You are hungry.');
          this.level = newLevel;
        } else {
          this.level = newLevel;
        }
      }

      this.spend(Actor.TICK);
    } else {
      this.diactivate();
    }

    return true;
  }

  satisfy(energy: number): void {
    this.affectHunger(energy);
  }

  affectHunger(energy: number, overrideLimits = false): void {
    const oldLevel = this.level;
    this.level -= energy;

    if (this.level < 0 && !overrideLimits) {
      this.level = 0;
    } else if (this.level > Hunger.STARVING) {
      const excess = this.level - Hunger.STARVING;
      this.level = Hunger.STARVING;
      this.partialDamage += excess * (this.target!.HT / 1000);
      if (this.partialDamage > 1) {
        this.target!.takeDamage(Math.floor(this.partialDamage), this.target!);
        this.partialDamage -= Math.floor(this.partialDamage);
      }
    }

    if (oldLevel < Hunger.HUNGRY && this.level >= Hunger.HUNGRY) {
      GLog.add('##You are hungry.');
    } else if (oldLevel < Hunger.STARVING && this.level >= Hunger.STARVING) {
      GLog.add('!!You are starving!');
      this.target!.takeDamage(1, this.target!);
    }
  }

  isStarving(): boolean {
    return this.level >= Hunger.STARVING;
  }

  hunger(): number {
    return Math.ceil(this.level);
  }

  override icon(): number {
    if (this.level < Hunger.HUNGRY) {
      return -1;
    } else if (this.level < Hunger.STARVING) {
      return -1;
    }
    return -1;
  }

  override name(): string {
    if (this.level < Hunger.STARVING) {
      return 'Hungry';
    }
    return 'Starving';
  }

  override desc(): string {
    if (this.level < Hunger.STARVING) {
      return 'desc_intro_hungry desc';
    }
    return 'desc_intro_starving desc';
  }

  onDeath(): void {
    GLog.add(`!!${this.name()} has killed you.`);
  }
}
