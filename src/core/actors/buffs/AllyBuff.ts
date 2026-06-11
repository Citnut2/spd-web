// Port of com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff

import { Buff } from './Buff';
import type { Char } from '../Char';
import { Alignment } from '../Char';

export abstract class AllyBuff extends Buff {
  revivePersists = true;

  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.alignment = Alignment.ALLY;
      return true;
    }
    return false;
  }
}
