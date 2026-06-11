// Port of com.shatteredpixel.shatteredpixeldungeon.actors.Char

import { Actor } from './Actor';
import { Float, IntRange } from '../utils/Random';
import { GLog } from '../../ui/GLog';
import { Game } from '../engine/Game';
import type { Buff } from './buffs/Buff';
import type { CharSprite } from '../sprites/CharSprite';
import { LevelRef } from '../levels/LevelRef';

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

  invisible = 0;
  paralysed = 0;
  flying = false;

  sprite: CharSprite | null = null;

  // Buff management
  buffs: Buff[] = [];

  isAlive(): boolean {
    return this.HP > 0;
  }

  moveTo(newPos: number): void {
    const prev = this.pos;
    this.pos = newPos;
    this.spend(Actor.TIME_TO_MOVE);
    if (this.sprite) {
      this.sprite.turnTo(prev, newPos);
    }
  }

  canMoveTo(cell: number, passable: boolean[]): boolean {
    return passable[cell] === true;
  }

  get displayName(): string {
    return this.constructor.name;
  }

  attack(target: Char): boolean {
    if (this.sprite) {
      this.sprite.turnTo(this.pos, target.pos);
    }

    const surprised = target.surprisedBy(this);

    if (surprised || this.hit(target)) {
      let dmg = this.damageRoll();
      dmg = this.attackProc(target, dmg);
      dmg = target.defenseProc(this, dmg);
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

  hit(target: Char): boolean {
    const acuRoll = Float(this.attackSkill(target));
    const defRoll = Float(target.defenseSkill(this));
    return acuRoll >= defRoll;
  }

  attackSkill(_target: Char): number {
    return this.baseAttackSkill + this.attackSkillBonus;
  }

  defenseSkill(_target: Char): number {
    return this.baseDefenseSkill + this.defenseSkillBonus;
  }

  attackProc(_target: Char, damage: number): number {
    return damage;
  }

  defenseProc(_enemy: Char, damage: number): number {
    return damage;
  }

  damageRoll(): number {
    return IntRange(1, 4);
  }

  drRoll(): number {
    return 0;
  }

  takeDamage(dmg: number, _src: Char): void {
    const effective = Math.max(0, dmg - this.drRoll());
    this.HP = Math.max(0, this.HP - effective);
    if (this.HP <= 0) {
      this.die(_src);
    }
  }

  die(_src: Char): void {
    if (this.alignment === Alignment.ALLY) {
      GLog.add(`!!You were killed by ${_src.displayName}...`);
    } else {
      GLog.add(`${this.displayName} was killed!`);
    }
  }

  surprisedBy(attacker: Char): boolean {
    const level = LevelRef.current;
    if (!level) return false;
    const d = this.distanceBetween(attacker.pos, this.pos, level.width);
    return !level.heroFOV[attacker.pos] && d <= 1;
  }

  distanceBetween(a: number, b: number, mapWidth?: number): number {
    const w = mapWidth ?? LevelRef.current?.width ?? 1;
    const ax = a % w;
    const ay = Math.floor(a / w);
    const bx = b % w;
    const by = Math.floor(b / w);
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ----- Buff management -----

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
    return 1;
  }

  speed(): number {
    let base = 1;
    if (this.hasBuff('Cripple')) base *= 0.5;
    if (this.hasBuff('Slow')) base *= 0.5;
    if (this.hasBuff('Haste')) base *= 2;
    return base;
  }
}
