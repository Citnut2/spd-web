// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite

import { AnimatedSprite, Container, Texture } from 'pixi.js';
import { Char } from '../actors/Char';
import { DungeonTilemap } from '../rendering/DungeonTilemap';
import { TextureFilm } from '../rendering/TextureFilm';

export class CharSprite extends Container {
  static readonly DEFAULT = 0xFFFFFF;
  static readonly POSITIVE = 0x00FF00;
  static readonly NEGATIVE = 0xFF0000;
  static readonly WARNING = 0xFF8800;
  static readonly NEUTRAL = 0xFFFF00;

  static readonly DEFAULT_MOVE_INTERVAL = 0.1;

  protected perspectiveRaise = 6 / 16;

  protected renderShadow = false;
  protected shadowWidth = 1.2;
  protected shadowHeight = 0.25;
  protected shadowOffset = 0.25;

  protected ch: Char | null = null;
  protected animSprite: AnimatedSprite | null = null;
  protected frameWidth = 16;
  protected frameHeight = 16;
  protected mapWidth = 38;

  protected animCallback: (() => void) | null = null;

  // movement animation
  private _moveFromX = 0;
  private _moveFromY = 0;
  private _moveToX = 0;
  private _moveToY = 0;
  private _moveProgress = 0;
  private _moveDuration = 0.1;
  private _moveCallback: (() => void) | null = null;

  isMoving = false;

  protected sleeping = false;
  protected flashTime = 0;

  constructor() {
    super();
    this.eventMode = 'none';
  }

  protected createAnimSprite(frames: Texture[]): void {
    if (this.animSprite) {
      this.removeChild(this.animSprite);
      this.animSprite.destroy();
    }
    this.animSprite = new AnimatedSprite(frames, true);
    this.animSprite.anchor.set(0.5, 1);
    this.animSprite.animationSpeed = 0.1;
    this.animSprite.eventMode = 'none';
    this.animSprite.onComplete = () => {
      if (this.animCallback) {
        const cb = this.animCallback;
        this.animCallback = null;
        cb();
      }
    };
    this.addChild(this.animSprite);
  }

  protected createFrames(tex: Texture, film: TextureFilm, ...indices: number[]): Texture[] {
    return indices.map(i => {
      const rect = film.get(i);
      if (!rect) {
        throw new Error(`Frame ${i} not found in texture film`);
      }
      return new Texture({ source: tex.source, frame: rect.clone() });
    });
  }

  link(ch: Char, mapWidth?: number): void {
    this.ch = ch;
    ch.sprite = this;
    if (mapWidth !== undefined) this.mapWidth = mapWidth;
    this.place(ch.pos);
  }

  place(cell: number, mapWidth?: number): void {
    const mw = mapWidth ?? this.mapWidth;
    const x = ((cell % mw) + 0.5) * DungeonTilemap.SIZE;
    const y = (Math.floor(cell / mw) + 1) * DungeonTilemap.SIZE
      - this.perspectiveRaise * this.frameHeight;
    this.position.set(x, y);
  }

  startMove(fromCell: number, toCell: number, mapWidth?: number, onComplete?: () => void): void {
    const mw = mapWidth ?? this.mapWidth;
    this.turnTo(fromCell, toCell, mw);
    this._moveFromX = ((fromCell % mw) + 0.5) * DungeonTilemap.SIZE;
    this._moveFromY = (Math.floor(fromCell / mw) + 1) * DungeonTilemap.SIZE
      - this.perspectiveRaise * this.frameHeight;
    this._moveToX = ((toCell % mw) + 0.5) * DungeonTilemap.SIZE;
    this._moveToY = (Math.floor(toCell / mw) + 1) * DungeonTilemap.SIZE
      - this.perspectiveRaise * this.frameHeight;
    this._moveProgress = 0;
    this._moveDuration = CharSprite.DEFAULT_MOVE_INTERVAL;
    this._moveCallback = onComplete ?? null;
    this.isMoving = true;
    this.playRun();
  }

  protected playRun(): void {
  }

  updateMove(dt: number): void {
    if (!this.isMoving) return;
    this._moveProgress += dt / this._moveDuration;
    if (this._moveProgress >= 1) {
      this._moveProgress = 1;
      this.isMoving = false;
      this.position.set(this._moveToX, this._moveToY);
      if (this._moveCallback) {
        const cb = this._moveCallback;
        this._moveCallback = null;
        cb();
      }
      this.idle();
    } else {
      const t = this._moveProgress;
      this.position.set(
        this._moveFromX + (this._moveToX - this._moveFromX) * t,
        this._moveFromY + (this._moveToY - this._moveFromY) * t,
      );
    }
  }

  updateSprite(mapWidth?: number): void {
    if (!this.ch) return;
    this.place(this.ch.pos, mapWidth);
  }

  idle(): void {
  }

  playAnim(frames: Texture[], loop: boolean, speed: number, onComplete?: () => void): void {
    if (!this.animSprite) {
      this.createAnimSprite(frames);
    }
    const s = this.animSprite!;
    s.textures = frames;
    s.animationSpeed = speed;
    s.loop = loop;
    this.animCallback = onComplete ?? null;
    s.gotoAndPlay(0);
  }

  flash(): void {
    this.flashTime = 0.05;
  }

  setVisible(v: boolean): void {
    this.visible = v;
  }

  turnTo(from: number, to: number, mapWidth?: number): void {
    if (!this.animSprite) return;
    const mw = mapWidth ?? this.mapWidth;
    const fromX = from % mw;
    const toX = to % mw;
    if (toX < fromX) {
      this.animSprite.scale.x = -1;
    } else if (toX > fromX) {
      this.animSprite.scale.x = 1;
    }
  }

  /** Utility: compute row difference for facing (up/down) */
  protected yCell(cell: number): number {
    return Math.floor(cell / this.mapWidth);
  }

  destroy(): void {
    if (this.animSprite) {
      this.animSprite.removeFromParent();
      this.animSprite.destroy();
      this.animSprite = null;
    }
    this.removeFromParent();
    super.destroy();
  }
}
