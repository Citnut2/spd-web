import { BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';

export class Bless extends FlavourBuff {
  static readonly DURATION = 30;

  constructor() {
    super();
    this.type = BuffType.POSITIVE;
    this.announced = true;
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Bless.DURATION - this.visualCooldown()) / Bless.DURATION);
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}
