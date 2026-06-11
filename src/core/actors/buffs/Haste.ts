import { BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';

export class Haste extends FlavourBuff {
  static readonly DURATION = 20;

  constructor() {
    super();
    this.type = BuffType.POSITIVE;
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Haste.DURATION - this.visualCooldown()) / Haste.DURATION);
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}
