import { BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Char } from '../Char';
import { Dungeon } from '../../levels/Dungeon';

export class Levitation extends FlavourBuff {
  static readonly DURATION = 20;

  constructor() {
    super();
    this.type = BuffType.POSITIVE;
  }

  override attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.flying = true;
      return true;
    }
    return false;
  }

  override detach(): void {
    this.target!.flying = false;
    super.detach();
    Dungeon.level.occupyCell(this.target!);
  }

  detachesWithinDelay(delay: number): boolean {
    return this.cooldown() < delay;
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Levitation.DURATION - this.visualCooldown()) / Levitation.DURATION);
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}
