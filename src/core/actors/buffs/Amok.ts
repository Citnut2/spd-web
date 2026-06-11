import { BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { Char, Alignment } from '../Char';
import { Dungeon } from '../../levels/Dungeon';

export class Amok extends FlavourBuff {
  constructor() {
    super();
    this.type = BuffType.NEGATIVE;
    this.announced = true;
  }

  override icon(): number {
    return -1;
  }

  override detach(): void {
    if (this.target!.isAlive()) {
      if (this.target!.alignment === Alignment.ENEMY) {
        for (const _m of Dungeon.level.mobs) {
          if (_m instanceof Char && _m.alignment === Alignment.ENEMY && _m !== this.target) {
          }
        }
      }
    }
    super.detach();
  }

  override desc(): string {
    return `desc ${this.dispTurns(this.visualCooldown())}`;
  }
}
