import { Trap } from './Trap';
import { Buff } from '../../actors/buffs/Buff';
import { Poison } from '../../actors/buffs/Poison';
import { GLog } from '../../../ui/GLog';

let getDepth: (() => number) | null = null;
let getMobAt: ((pos: number) => any) | null = null;
let isHeroAt: ((pos: number) => boolean) | null = null;

export function setPoisonDartTrapGlobals(opts: {
  getDepth: () => number;
  getMobAt: (pos: number) => any;
  isHeroAt: (pos: number) => boolean;
}): void {
  getDepth = opts.getDepth;
  getMobAt = opts.getMobAt;
  isHeroAt = opts.isHeroAt;
}

export class PoisonDartTrap extends Trap {
  activate(): void {
    if (!getMobAt) return;
    const ch = getMobAt(this.pos);
    if (ch) {
      const depth = getDepth ? getDepth() : 1;
      const dmg = 1 + Math.floor(depth / 2);
      ch.takeDamage(dmg, ch);
      Buff.affect(ch, Poison).set(2 + Math.floor(depth / 3));
      if (isHeroAt && isHeroAt(this.pos)) {
        GLog.add(`!!A poison dart hits you for ${dmg} damage!`);
      }
    }
  }

  getColor(): number {
    return 0;
  }

  getShape(): number {
    return 0;
  }
}
