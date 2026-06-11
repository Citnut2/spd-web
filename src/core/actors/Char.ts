// Port of com.shatteredpixel.shatteredpixeldungeon.actors.Char

import { Actor } from './Actor';
import { Float, IntRange } from '../utils/Random';
import { GLog } from '../../ui/GLog';
import { Game } from '../engine/Game';
import type { Buff } from './buffs/Buff';

export enum Alignment {
  ENEMY = 'ENEMY',
  NEUTRAL = 'NEUTRAL',
  ALLY = 'ALLY'
}

export abstract class Char extends Actor {
  pos = 0;
  HP = 1;
  HT = 1;
  baseAttackSkill = 10;
  baseDefenseSkill = 5;
  alignment: Alignment = Alignment.ENEMY;

  STR = 8;
  attackSkillBonus = 0;
  defenseSkillBonus = 0;

  needsShieldUpdate = false;

  // Buff management
  buffs: Buff[] = [];

  isAlive(): boolean {
    return this.HP > 0;
  }

  /** Move to a new position */
  moveTo(newPos: number): void {
    this.pos = newPos;
    this.spend(Actor.TIME_TO_MOVE);
  }

  /** Check if a cell can be moved into */
  canMoveTo(cell: number, passable: boolean[]): boolean {
    return passable[cell] === true;
  }

  get displayName(): string {
    return this.constructor.name;
  }

  /** Attack a target character */
  attack(target: Char): boolean {
    if (this.hit(target)) {
      const dmg = this.damageRoll();
      target.takeDamage(dmg, this);
      if (this.alignment === Alignment.ALLY) {
        GLog.add(`@@You hit ${target.displayName} for ${dmg} damage`);
      } else if (target.alignment === Alignment.ALLY) {
        GLog.add(`!!${this.displayName} hits you for ${dmg} damage`);
      } else {
        GLog.add(`${this.displayName} hits ${target.displayName} for ${dmg} damage`);
      }
      this.spend(Actor.TIME_TO_MOVE);
      return true;
    }
    if (this.alignment === Alignment.ALLY) {
      GLog.add(`##You missed ${target.displayName}`);
    } else if (target.alignment === Alignment.ALLY) {
      GLog.add(`${this.displayName} missed!`);
    }
    this.spend(Actor.TIME_TO_MOVE);
    return false;
  }

  /** Hit check: compare attacker skill vs defender skill */
  hit(target: Char): boolean {
    const accuracy = 1;
    const acuRoll = Float(this.baseAttackSkill);
    const defRoll = Float(target.baseDefenseSkill);
    return acuRoll >= defRoll * accuracy;
  }

  /** Base damage roll (overridden by subclasses) */
  damageRoll(): number {
    return IntRange(1, 4);
  }

  /** Defense roll */
  drRoll(): number {
    return 0;
  }

  /** Take damage */
  takeDamage(dmg: number, _src: Char): void {
    const effective = Math.max(0, dmg - this.drRoll());
    this.HP = Math.max(0, this.HP - effective);
    if (this.HP <= 0) {
      if (this.alignment === Alignment.ALLY) {
        GLog.add(`!!You were killed by ${_src.displayName}...`);
      } else {
        GLog.add(`${this.displayName} was killed!`);
      }
    }
  }

  // ----- Buff management (matching Java Char) -----

  addBuff(buff: Buff): boolean {
    if (this.buffs.includes(buff)) return false;
    this.buffs.push(buff);
    if (Game.instance) Game.instance.add(buff);
    return true;
  }

  removeBuff(buff: Buff): boolean {
    const idx = this.buffs.indexOf(buff);
    if (idx === -1) return false;
    this.buffs.splice(idx, 1);
    if (Game.instance) Game.instance.remove(buff);
    return true;
  }

  findBuff<T extends Buff>(cl: new (...args: any[]) => T): T | undefined {
    return this.buffs.find(b => b instanceof cl) as T | undefined;
  }

  findAllBuffs<T extends Buff>(cl: new (...args: any[]) => T): T[] {
    return this.buffs.filter(b => b instanceof cl) as T[];
  }

  hasBuff(name: string): boolean {
    return this.buffs.some(b => b.name() === name);
  }

  getBuff(name: string): Buff | undefined {
    return this.buffs.find(b => b.name() === name);
  }

  isImmune<T extends Buff>(cl: new (...args: any[]) => T): boolean {
    for (const b of this.buffs) {
      if (b.immunities().has(cl as any)) return true;
    }
    return false;
  }

  resist<T extends Buff>(_cl: new (...args: any[]) => T): number {
    // Default resistance is 1 (no resistance)
    // Subclasses can override
    return 1;
  }

  /** Speed considering buffs (Cripple, Slow, Haste, etc.) */
  speed(): number {
    let base = 1;
    if (this.hasBuff('Cripple')) base *= 0.5;
    if (this.hasBuff('Slow')) base *= 0.5;
    if (this.hasBuff('Haste')) base *= 2;
    return base;
  }
}
