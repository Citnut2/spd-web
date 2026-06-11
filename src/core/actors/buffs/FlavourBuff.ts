// Port of com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff

import { Buff } from './Buff';

export class FlavourBuff extends Buff {
  act(): boolean {
    this.detach();
    return true;
  }

  desc(): string {
    return `${this.dispTurns(this.visualCooldown())}`;
  }

  iconTextDisplay(): string {
    return String(Math.floor(this.visualCooldown()));
  }
}
