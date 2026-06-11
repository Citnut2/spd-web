// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.SnakeSprite

import { MobSprite } from './MobSprite';
import { Texture } from 'pixi.js';
import { TextureFilm } from '../rendering/TextureFilm';

const SNAKE_FRAME_WIDTH = 14;
const SNAKE_FRAME_HEIGHT = 12;

export class SnakeSprite extends MobSprite {
  protected idleFrames: Texture[] = [];
  protected runFrames: Texture[] = [];
  protected attackFrames: Texture[] = [];
  protected dieFrames: Texture[] = [];

  constructor() {
    super();
    this.frameWidth = SNAKE_FRAME_WIDTH;
    this.frameHeight = SNAKE_FRAME_HEIGHT;
  }

  init(texture: Texture): void {
    const film = new TextureFilm(texture.width, texture.height, SNAKE_FRAME_WIDTH, SNAKE_FRAME_HEIGHT);

    this.idleFrames = this.createFrames(texture, film, 0, 0, 0, 0, 0, 0, 0);
    this.runFrames = this.createFrames(texture, film, 0, 1, 2, 3, 4, 5);
    this.attackFrames = this.createFrames(texture, film, 0, 1, 2, 3);
    this.dieFrames = this.createFrames(texture, film, 4, 5, 6, 7);

    this.createAnimSprite(this.idleFrames);
    const s = this.animSprite!;
    s.loop = true;
    s.animationSpeed = 3;
  }

  idle(): void {
    const s = this.animSprite;
    if (s && this.idleFrames.length > 0) {
      s.textures = this.idleFrames;
      s.loop = true;
      s.animationSpeed = 3;
      s.play();
    }
  }

  protected override playRun(): void {
    const s = this.animSprite;
    if (s && this.runFrames.length > 0) {
      s.textures = this.runFrames;
      s.loop = true;
      s.animationSpeed = 2;
      s.play();
    }
  }
}
