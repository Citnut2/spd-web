import { Buff, BuffType } from './Buff';
import { Actor } from '../Actor';
import { Char } from '../Char';
import { Chill } from './Chill';
import { Dungeon } from '../../levels/Dungeon';
import { Bundle } from '../../utils/Bundle';
import { NormalIntRange } from '../../utils/Random';
import { GLog } from '../../../ui/GLog';

export class Burning extends Buff {
  private static readonly DURATION = 8;

  private left = 0;
  private acted = false;
  private burnIncrement = 0;

  private static readonly LEFT = 'left';
  private static readonly ACTED = 'acted';
  private static readonly BURN = 'burnIncrement';

  constructor() {
    super();
    this.type = BuffType.NEGATIVE;
    this.announced = true;
  }

  override storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put(Burning.LEFT, this.left);
    bundle.put(Burning.ACTED, this.acted);
    bundle.put(Burning.BURN, this.burnIncrement);
  }

  override restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left = bundle.getFloat(Burning.LEFT);
    this.acted = bundle.getBoolean(Burning.ACTED);
    this.burnIncrement = bundle.getInt(Burning.BURN);
  }

  override attachTo(target: Char): boolean {
    Buff.detach(target, Chill);
    return super.attachTo(target);
  }

  override act(): boolean {
    const target = this.target!;
    if (this.acted && Dungeon.level.water[target.pos] && !target.flying) {
      this.detach();
    } else if (target.isAlive() && !target.isImmune(Burning)) {
      this.acted = true;
      const damage = NormalIntRange(1, 3 + Math.floor(Dungeon.depth / 4));
      Buff.detach(target, Chill);

      target.takeDamage(damage, target);
      this.burnIncrement++;

      this.spend(Actor.TICK);
      this.left -= Actor.TICK;

      if (this.left <= 0 || (Dungeon.level.water[target.pos] && !target.flying)) {
        this.detach();
      }

      return true;
    }

    this.detach();
    return true;
  }

  reignite(_ch: Char): void;
  reignite(_ch: Char, duration: number): void;
  reignite(_ch: Char, duration?: number): void {
    const dur = duration !== undefined ? duration : Burning.DURATION;
    if (this.left < dur) this.left = dur;
    this.acted = false;
  }

  extend(duration: number): void {
    this.left += duration;
  }

  override icon(): number {
    return -1;
  }

  override iconFadePercent(): number {
    return Math.max(0, (Burning.DURATION - this.left) / Burning.DURATION);
  }

  override iconTextDisplay(): string {
    return String(Math.floor(this.left));
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.left)}`;
  }

  onDeath(): void {
    GLog.add(`!!${this.name()} has killed you.`);
  }
}
