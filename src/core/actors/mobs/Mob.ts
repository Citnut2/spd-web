// Port of com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob

import { Char, Alignment } from '../Char';
import { Actor } from '../Actor';
import { PathFinder } from '../../utils/PathFinder';
import { Float, Int as RandInt } from '../../utils/Random';
import { Dungeon } from '../../levels/Dungeon';
import type { Item } from '../../items/Item';

export enum MobState {
  SLEEPING = 'SLEEPING',
  WANDERING = 'WANDERING',
  HUNTING = 'HUNTING',
  FLEEING = 'FLEEING',
  PASSIVE = 'PASSIVE'
}

export abstract class Mob extends Char {
  state: MobState = MobState.SLEEPING;
  priority = Actor.MOB_PRIO;
  EXP = 1;
  maxLvl = Number.MAX_SAFE_INTEGER;

  maxLoot = 0;
  lootChance = 0;
  loot: Item | null = null;

  enemy?: Char;
  enemyPos = -1;
  huntTime = 0;
  wanderTime = 0;

  enemySeen = false;
  target = -1;

  baseSpeed = 1;

  protected _properties: Set<string> = new Set();

  constructor() {
    super();
    this.alignment = Alignment.ENEMY;
  }

  properties(): Set<string> {
    return this._properties;
  }

  abstract act(): boolean;

  chooseEnemy(): void {
    const hero = Dungeon.hero;
    if (!hero || !hero.isAlive()) {
      this.enemy = undefined;
      return;
    }
    if (this.enemy && this.enemy.isAlive()) return;
    this.enemy = hero;
  }

  actAI(): boolean {
    this.chooseEnemy();
    if (this.state === MobState.SLEEPING) {
      return this.actSleep();
    }

    if (this.state !== MobState.FLEEING && this.HP <= Math.floor(this.HT * 0.3)) {
      this.state = MobState.FLEEING;
    }

    this.enemySeen = false;
    if (this.enemy && this.enemy.isAlive() && this.enemy.pos !== this.pos) {
      this.enemySeen = this.canSee(this.enemy, Dungeon.level.heroFOV);
    }
    if (this.enemy && (!this.enemy.isAlive() || !this.canSee(this.enemy, Dungeon.level.heroFOV))) {
      this.enemy = undefined;
      if (this.state === MobState.FLEEING && !this.enemySeen) {
        this.state = MobState.WANDERING;
      }
    }
    switch (this.state) {
      case MobState.WANDERING:
        return this.actWander();
      case MobState.HUNTING:
        return this.actHunt();
      case MobState.FLEEING:
        return this.actFlee();
      case MobState.PASSIVE:
        this.spend(Actor.TICK);
        return true;
      default:
        this.spend(Actor.TICK);
        return true;
    }
  }

  protected actSleep(): boolean {
    const level = Dungeon.level;
    if (level && level.heroFOV[this.pos]) {
      this.state = MobState.WANDERING;
      return this.actWander();
    }
    this.spend(Actor.TICK);
    return true;
  }

  protected actWander(): boolean {
    if (this.enemySeen && this.enemy) {
      this.state = MobState.HUNTING;
      return this.actHunt();
    }
    if (this.target === -1 || this.wanderTime <= 0 || !Dungeon.level.passable[this.target]) {
      this.target = this.randomDestination();
      this.wanderTime = 1 + RandInt(5);
    }
    this.wanderTime--;
    if (this.target !== -1) {
      const step = this.getStep(this.target);
      if (step !== -1 && step !== this.pos) {
        this.move(step);
      }
    }
    this.spend(Actor.TICK);
    return true;
  }

  protected actHunt(): boolean {
    if (this.enemySeen && this.enemy) {
      this.target = this.enemy.pos;
      if (this.canAttack(this.enemy)) {
        return this.doAttack(this.enemy);
      }
      this.huntTime = 3;
    } else {
      this.huntTime--;
      if (this.huntTime <= 0 && this.target !== -1) {
        this.state = MobState.WANDERING;
        return this.actWander();
      }
    }
    if (this.target !== -1) {
      const step = this.getStep(this.target);
      if (step !== -1 && step !== this.pos && !Dungeon.level.solid[step]) {
        this.move(step);
      }
    }
    this.spend(Actor.TIME_TO_MOVE);
    return true;
  }

  protected actFlee(): boolean {
    if (this.enemySeen && this.enemy) {
      const step = this.getStepAway(this.enemy.pos);
      if (step !== -1 && step !== this.pos) {
        this.move(step);
      }
    }
    this.spend(Actor.TIME_TO_MOVE);
    return true;
  }

  move(cell: number): void {
    if (Dungeon.level && Dungeon.level.passable[cell]) {
      const prev = this.pos;
      this.pos = cell;
      if (this.sprite) {
        this.sprite.startMove(prev, cell, Dungeon.level.width);
      }
    }
  }

  getStep(target: number): number {
    const level = Dungeon.level;
    if (!level) return -1;
    return PathFinder.getStep(this.pos, target, level.passable);
  }

  getStepAway(target: number): number {
    const level = Dungeon.level;
    if (!level) return -1;
    let best = -1;
    let bestDist = 0;
    for (const n of level.getNeighbours8(this.pos)) {
      if (level.passable[n]) {
        const dist = this.distanceBetween(n, target);
        if (dist > bestDist) {
          bestDist = dist;
          best = n;
        }
      }
    }
    return best;
  }

  canAttack(enemy: Char): boolean {
    if (enemy.pos === this.pos) return true;
    const level = Dungeon.level;
    if (!level) return false;
    const dist = level.cellToPoint(this.pos);
    const enemyP = level.cellToPoint(enemy.pos);
    return Math.abs(dist.x - enemyP.x) <= 1 && Math.abs(dist.y - enemyP.y) <= 1;
  }

  doAttack(enemy: Char): boolean {
    if (this.sprite) {
      this.sprite.turnTo(this.pos, enemy.pos);
    }
    return this.attack(enemy);
  }

  canSee(target: Char, fov: boolean[]): boolean {
    return fov[target.pos] === true;
  }

  protected randomDestination(): number {
    const level = Dungeon.level;
    if (!level) return -1;
    return level.getRandomEmptyCell();
  }

  surprisedBy(hero: Char): boolean {
    if (this.enemy == null) return false;
    const d = this.distanceBetween(hero.pos, this.pos);
    return !this.enemySeen && d <= 1;
  }

  checkSurprise(hero: Char): boolean {
    if (this.surprisedBy(hero)) {
      return true;
    }
    return false;
  }

  damageRoll(): number {
    return 1;
  }

  attackSkill(_target: Char): number {
    return this.baseAttackSkill;
  }

  defenseSkill(_target: Char): number {
    return this.baseDefenseSkill;
  }

  defenseProc(_enemy: Char, damage: number): number {
    return damage;
  }

  createLoot(): Item | null {
    if (this.loot && Float() < this.lootChance) {
      const lootItem = this.loot;
      this.loot = null;
      return lootItem;
    }
    return null;
  }

  die(_src: Char): void {
    super.die(_src);
    const loot = this.createLoot();
    if (loot) {
      const level = Dungeon.level;
      if (level) {
        level.drop(loot, this.pos);
      }
    }
    // Remove from level mob list
    const level = Dungeon.level;
    if (level) {
      const idx = level.mobs.indexOf(this);
      if (idx >= 0) {
        level.mobs.splice(idx, 1);
      }
    }
  }
}
