// Port of com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff

import { Actor } from '../Actor';
import type { Char } from '../Char';
import { FlavourBuff } from './FlavourBuff';
import { CounterBuff } from './CounterBuff';

export enum BuffType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL'
}

export abstract class Buff extends Actor {
  target: Char | null = null;
  mnemonicExtended = false;
  type: BuffType = BuffType.NEUTRAL;
  announced = false;
  revivePersists = false;

  protected _resistances: Set<new (...args: any[]) => Buff> = new Set();
  protected _immunities: Set<new (...args: any[]) => Buff> = new Set();

  priority = Actor.BUFF_PRIO;

  resistances(): Set<new (...args: any[]) => Buff> {
    return new Set(this._resistances);
  }

  immunities(): Set<new (...args: any[]) => Buff> {
    return new Set(this._immunities);
  }

  attachTo(target: Char): boolean {
    if (target.isImmune(this.constructor as new (...args: any[]) => Buff)) {
      return false;
    }
    this.target = target;
    if (target.addBuff(this)) {
      return true;
    }
    this.target = null;
    return false;
  }

  detach(): void {
    if (this.target) {
      this.target.removeBuff(this);
    }
  }

  act(): boolean {
    this.diactivate();
    return true;
  }

  icon(): number {
    return -1; // BuffIndicator.NONE equivalent
  }

  iconFadePercent(): number {
    return 0;
  }

  iconTextDisplay(): string {
    return '';
  }

  fx(_on: boolean): void {
    // override in subclasses
  }

  heroMessage(): string | null {
    return null;
  }

  name(): string {
    return this.constructor.name;
  }

  desc(): string {
    return '';
  }

  protected dispTurns(input: number): string {
    return input.toFixed(2);
  }

  visualCooldown(): number {
    return this.cooldown() + 1;
  }

  protected cooldown(): number {
    if (!this.target) return 0;
    let max = Number.MIN_VALUE;
    for (const b of this.target.buffs) {
      if (b !== this && b.time < Number.MAX_VALUE) {
        max = Math.max(max, b.time);
      }
    }
    return max > Number.MIN_VALUE ? max : 0;
  }

  // Static helper methods matching Java's Buff.append/affect/prolong/count/detach

  static append<T extends Buff>(
    target: Char,
    buffClass: new (...args: any[]) => T
  ): T {
    const buff = new buffClass();
    buff.attachTo(target);
    return buff;
  }

  static appendDuration<T extends FlavourBuff>(
    target: Char,
    buffClass: new (...args: any[]) => T,
    duration: number
  ): T {
    const buff = Buff.append(target, buffClass);
    buff.spend(duration * target.resist(buffClass));
    return buff;
  }

  static affect<T extends Buff>(
    target: Char,
    buffClass: new (...args: any[]) => T
  ): T {
    const existing = target.findBuff(buffClass);
    if (existing) return existing;
    return Buff.append(target, buffClass);
  }

  static affectDuration<T extends FlavourBuff>(
    target: Char,
    buffClass: new (...args: any[]) => T,
    duration: number
  ): T {
    const buff = Buff.affect(target, buffClass);
    buff.spend(duration * target.resist(buffClass));
    return buff;
  }

  static prolong<T extends FlavourBuff>(
    target: Char,
    buffClass: new (...args: any[]) => T,
    duration: number
  ): T {
    const buff = Buff.affect(target, buffClass);
    buff.postpone(duration * target.resist(buffClass));
    return buff;
  }

  static count<T extends CounterBuff>(
    target: Char,
    buffClass: new (...args: any[]) => T,
    count: number
  ): T {
    const buff = Buff.affect(target, buffClass);
    buff.countUp(count);
    return buff;
  }

  static detachBuff<T extends Buff>(
    target: Char,
    buffClass: new (...args: any[]) => T
  ): void {
    const toDetach = target.findAllBuffs(buffClass);
    for (const b of toDetach) {
      b.detach();
    }
  }
}
