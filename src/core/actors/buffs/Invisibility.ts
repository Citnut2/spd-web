import { BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Char } from '../Char';
import { Dungeon } from '../../levels/Dungeon';

export class Invisibility extends FlavourBuff {
  static readonly DURATION = 20;

  constructor() {
    super();
    this.type = BuffType.POSITIVE;
    this.announced = true;
  }

  override attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.invisible++;
      return true;
    }
    return false;
  }

  override detach(): void {
    if (this.target!.invisible > 0) {
      this.target!.invisible--;
    }
    super.detach();
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Invisibility.DURATION - this.visualCooldown()) / Invisibility.DURATION);
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }

  static dispel(ch?: Char): void {
    const c = ch ?? Dungeon.hero;
    if (c == null) return;
    for (const invis of c.findAllBuffs(Invisibility)) {
      invis.detach();
    }
  }
}
