import { Buff, BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Actor } from '../Actor';
import { Char } from '../Char';
import { Bundle } from '../../utils/Bundle';
import { NormalIntRange } from '../../utils/Random';

export class Paralysis extends FlavourBuff {
  static readonly DURATION = 10;

  constructor() {
    super();
    this.type = BuffType.NEGATIVE;
    this.announced = true;
  }

  override attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.paralysed++;
      return true;
    }
    return false;
  }

  processDamage(damage: number): void {
    if (this.target == null) return;
    const resist = this.target.findBuff(ParalysisResist);
    const res = resist ?? Buff.affect(this.target, ParalysisResist);
    res.damage += damage;
    if (NormalIntRange(0, res.damage) >= NormalIntRange(0, this.target.HP)) {
      this.detach();
    }
  }

  override detach(): void {
    super.detach();
    if (this.target!.paralysed > 0) {
      this.target!.paralysed--;
    }
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Paralysis.DURATION - this.visualCooldown()) / Paralysis.DURATION);
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}

export class ParalysisResist extends Buff {
  damage = 0;
  private static readonly DAMAGE = 'damage';

  constructor() {
    super();
    this.type = BuffType.POSITIVE;
  }

  override act(): boolean {
    if (this.target!.findBuff(Paralysis) == null) {
      this.damage -= Math.ceil(this.damage / 10);
      if (this.damage <= 0) this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }

  override storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put(ParalysisResist.DAMAGE, this.damage);
  }

  override restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.damage = bundle.getInt(ParalysisResist.DAMAGE);
  }
}
