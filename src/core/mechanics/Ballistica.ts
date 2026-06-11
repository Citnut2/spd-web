import { Dungeon } from '../levels/Dungeon';

interface LevelView {
  width: number;
  length: number;
  passable: boolean[];
  solid: boolean[];
  avoid: boolean[];
  insideMap(cell: number): boolean;
}

export class Ballistica {
  path: number[] = [];
  sourcePos: number;
  collisionPos = 0;
  dist = 0;

  static readonly STOP_TARGET = 1;
  static readonly STOP_CHARS = 2;
  static readonly STOP_SOLID = 4;
  static readonly IGNORE_SOFT_SOLID = 8;

  static readonly PROJECTILE = this.STOP_TARGET | this.STOP_CHARS | this.STOP_SOLID;
  static readonly MAGIC_BOLT = this.STOP_CHARS | this.STOP_SOLID;
  static readonly WONT_STOP = 0;

  constructor(from: number, to: number, params: number) {
    this.sourcePos = from;
    this.build(
      from, to,
      (params & Ballistica.STOP_TARGET) !== 0,
      (params & Ballistica.STOP_CHARS) !== 0,
      (params & Ballistica.STOP_SOLID) !== 0,
      (params & Ballistica.IGNORE_SOFT_SOLID) !== 0,
    );

    const ci = this.path.indexOf(this.collisionPos);
    if (ci !== -1) {
      this.dist = ci;
    } else if (this.path.length > 0) {
      const last = this.path[this.path.length - 1];
      if (last !== undefined) this.collisionPos = last;
      this.dist = this.path.length - 1;
    } else {
      this.path.push(from);
      this.collisionPos = from;
      this.dist = 0;
    }
  }

  private build(
    from: number, to: number,
    stopTarget: boolean, _stopChars: boolean, stopTerrain: boolean, ignoreSoftSolid: boolean,
  ): void {
    const level = Dungeon.level as LevelView;
    if (!level) return;
    const w = level.width;

    const x0 = from % w;
    const x1 = to % w;
    const y0 = Math.floor(from / w);
    const y1 = Math.floor(to / w);

    let dx = x1 - x0;
    let dy = y1 - y0;

    const stepX = dx > 0 ? 1 : -1;
    const stepY = dy > 0 ? 1 : -1;

    dx = Math.abs(dx);
    dy = Math.abs(dy);

    let stepA: number;
    let stepB: number;
    let dA: number;
    let dB: number;

    if (dx > dy) {
      stepA = stepX;
      stepB = stepY * w;
      dA = dx;
      dB = dy;
    } else {
      stepA = stepY * w;
      stepB = stepX;
      dA = dy;
      dB = dx;
    }

    let cell = from;
    let err = Math.floor(dA / 2);

    this.path = [];

    while (level.insideMap(cell)) {
      if (this.collisionPos === 0 && stopTerrain && cell !== this.sourcePos) {
        const isBlocked = !level.passable[cell] && !level.avoid[cell];
        if (isBlocked) {
          const prevPath = this.path[this.path.length - 1];
          if (prevPath !== undefined) {
            this.collide(prevPath);
          }
        }
      }

      this.path.push(cell);

      if (this.collisionPos === 0 && stopTerrain && cell !== this.sourcePos && level.solid[cell]) {
        if (!(ignoreSoftSolid && (level.passable[cell] || level.avoid[cell]))) {
          this.collide(cell);
        }
      }
      if (this.collisionPos === 0 && cell === to && stopTarget) {
        this.collide(cell);
      }

      cell += stepA;
      err += dB;
      if (err >= dA) {
        err -= dA;
        cell += stepB;
      }
    }
  }

  private collide(cell: number): void {
    if (this.collisionPos === 0) {
      this.collisionPos = cell;
    }
  }

  subPath(start: number, end: number): number[] {
    const e = Math.min(end, this.path.length - 1);
    return this.path.slice(start, e + 1);
  }
}
