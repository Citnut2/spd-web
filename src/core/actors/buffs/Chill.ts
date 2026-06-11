import { Buff, BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Char } from '../Char';
import { Burning } from './Burning';

export class Chill extends FlavourBuff {
  static readonly DURATION = 10;

  constructor() {
    super();
    this.type = BuffType.NEGATIVE;
    this.announced = true;
  }

  override attachTo(target: Char): boolean {
    Buff.detach(target, Burning);
    return super.attachTo(target);
  }

  speedFactor(): number {
    return Math.max(0.5, 1 - this.cooldown() * 0.1);
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Chill.DURATION - this.visualCooldown()) / Chill.DURATION);
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())} ${(1 - this.speedFactor()) * 100}`;
  }
}
