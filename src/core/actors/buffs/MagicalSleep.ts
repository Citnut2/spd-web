import { Buff } from './Buff';
import { Char, Alignment } from '../Char';
import { Hero } from '../../hero/Hero';
import { Mob, MobState } from '../mobs/Mob';
import { GLog } from '../../../ui/GLog';

export class MagicalSleep extends Buff {
  private static readonly STEP = 1;

  override attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.paralysed++;

      if (target.alignment === Alignment.ALLY) {
        if (target.HP === target.HT) {
          if (target instanceof Hero) GLog.add('@@You are too healthy to sleep');
          this.detach();
          return true;
        } else {
          if (target instanceof Hero) GLog.add('@@You fall asleep');
        }
      }

      if (target instanceof Mob) {
        (target as Mob).state = MobState.SLEEPING;
      }

      return true;
    }
    return false;
  }

  override act(): boolean {
    if (this.target instanceof Mob && (this.target as Mob).state !== MobState.SLEEPING) {
      this.detach();
      return true;
    }
    if (this.target!.alignment === Alignment.ALLY) {
      this.target!.HP = Math.min(this.target!.HP + 1, this.target!.HT);
      if (this.target instanceof Hero) (this.target as Hero).resting = true;
      if (this.target!.HP === this.target!.HT) {
        if (this.target instanceof Hero) GLog.add('@@You wake up');
        this.detach();
      }
    }
    this.spend(MagicalSleep.STEP);
    return true;
  }

  override detach(): void {
    if (this.target!.paralysed > 0) {
      this.target!.paralysed--;
    }
    if (this.target instanceof Hero) {
      (this.target as Hero).resting = false;
    } else if (this.target instanceof Mob && this.target!.alignment === Alignment.ALLY && (this.target as Mob).state === MobState.SLEEPING) {
      (this.target as Mob).state = MobState.WANDERING;
    }
    super.detach();
  }

  override icon(): number {
    return -1;
  }

  override desc(): string {
    return 'desc';
  }
}
