import { BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Bundle } from '../../utils/Bundle';

export class Terror extends FlavourBuff {
  object = 0;
  ignoreNextHit = false;

  private static readonly OBJECT = 'object';

  static readonly DURATION = 20;

  constructor() {
    super();
    this.type = BuffType.NEGATIVE;
    this.announced = true;
  }

  override storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put(Terror.OBJECT, this.object);
  }

  override restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(Terror.OBJECT);
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Terror.DURATION - this.visualCooldown()) / Terror.DURATION);
  }

  recover(): void {
    if (this.ignoreNextHit) {
      this.ignoreNextHit = false;
      return;
    }
    this.spend(-5);
    if (this.cooldown() <= 0) {
      this.detach();
    }
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}
