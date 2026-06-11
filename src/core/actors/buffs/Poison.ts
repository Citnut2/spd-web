import { Buff, BuffType } from './Buff';
import { Actor } from '../Actor';
import { Char } from '../Char';
import { Bundle } from '../../utils/Bundle';
import { GLog } from '../../../ui/GLog';

export class Poison extends Buff {
  protected left = 0;

  private static readonly LEFT = 'left';

  constructor() {
    super();
    this.type = BuffType.NEGATIVE;
    this.announced = true;
  }

  override storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put(Poison.LEFT, this.left);
  }

  override restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left = bundle.getFloat(Poison.LEFT);
  }

  set(duration: number): void {
    this.left = Math.max(duration, this.left);
  }

  extend(duration: number): void {
    this.left += duration;
  }

  override icon(): number {
    return -1;
  }

  override iconTextDisplay(): string {
    return String(Math.floor(this.left));
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.left)}`;
  }

  override attachTo(target: Char): boolean {
    return super.attachTo(target);
  }

  override act(): boolean {
    const target = this.target!;
    if (target.isAlive()) {
      target.takeDamage(Math.floor(this.left / 3) + 1, target);
      this.spend(Actor.TICK);

      this.left -= Actor.TICK;
      if (this.left <= 0) {
        this.detach();
      }
    } else {
      this.detach();
    }

    return true;
  }

  onDeath(): void {
    GLog.add(`!!${this.name()} has killed you.`);
  }
}
