// Port of com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff

import { Buff } from './Buff';

export class CounterBuff extends Buff {
  private _count = 0;

  countUp(inc: number): void {
    this._count += inc;
  }

  countDown(inc: number): void {
    this._count -= inc;
  }

  count(): number {
    return this._count;
  }
}
