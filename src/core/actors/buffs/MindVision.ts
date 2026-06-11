import { BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Dungeon } from '../../levels/Dungeon';

export class MindVision extends FlavourBuff {
  static readonly DURATION = 20;
  distance = 2;

  constructor() {
    super();
    this.type = BuffType.POSITIVE;
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (MindVision.DURATION - this.visualCooldown()) / MindVision.DURATION);
  }

  override detach(): void {
    super.detach();
    Dungeon.observe();
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}
