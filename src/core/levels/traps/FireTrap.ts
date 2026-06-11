import { Trap } from './Trap';
import { Dungeon } from '../Dungeon';
import { Buff } from '../../actors/buffs/Buff';
import { Burning } from '../../actors/buffs/Burning';
import { GLog } from '../../../ui/GLog';

export class FireTrap extends Trap {
  activate(): void {
    const level = Dungeon.level;
    if (!level) return;
    if (level.heroFOV[this.pos]) {
      GLog.add('!!The trap emits a burst of flame!');
    }
    for (const n of level.getNeighbours4(this.pos)) {
      const ch = level.findMob(n);
      if (ch) {
        ch.takeDamage(1 + Math.floor(Dungeon.depth / 2), ch);
        Buff.affect(ch, Burning).set(2);
      }
    }
    const ch = level.findMob(this.pos);
    if (ch) {
      ch.takeDamage(2 + Math.floor(Dungeon.depth / 2), ch);
      Buff.affect(ch, Burning).set(4);
    }
  }

  getColor(): number {
    return 1;
  }

  getShape(): number {
    return 1;
  }
}
