import { Buff } from './Buff';
import { Actor } from '../Actor';
import { Hero } from '../../hero/Hero';
import { Bundle } from '../../utils/Bundle';

export class Regeneration extends Buff {
  private partialRegen = 0;
  private static readonly REGENERATION_DELAY = 10;
  private static readonly PARTIAL_REGEN = 'partial_regen';

  constructor() {
    super();
    this.priority = Actor.HERO_PRIO - 1;
  }

  override act(): boolean {
    if (this.target!.isAlive()) {
      if (Regeneration.regenOn() && this.target!.HP < this.regencap() && !(this.target as Hero).isStarving()) {
        let delay = Regeneration.REGENERATION_DELAY;
        this.partialRegen += 1 / delay;

        if (this.partialRegen >= 1) {
          this.target!.HP += Math.floor(this.partialRegen);
          this.partialRegen -= Math.floor(this.partialRegen);
          if (this.target!.HP >= this.regencap()) {
            this.target!.HP = this.regencap();
            (this.target as Hero).resting = false;
          }
        }
      }

      this.spend(Actor.TICK);
    } else {
      this.diactivate();
    }

    return true;
  }

  regencap(): number {
    return this.target!.HT;
  }

  static regenOn(): boolean {
    return true;
  }

  override storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put(Regeneration.PARTIAL_REGEN, this.partialRegen);
  }

  override restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.partialRegen = bundle.getFloat(Regeneration.PARTIAL_REGEN);
  }

  override desc(): string {
    return 'desc';
  }
}
