// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.CrabSprite

import { MobSprite } from './MobSprite';
import { Texture } from 'pixi.js';
import { TextureFilm } from '../rendering/TextureFilm';

const CRAB_FRAME_WIDTH = 17;
const CRAB_FRAME_HEIGHT = 14;

export class CrabSprite extends MobSprite {
  protected idleFrames: Texture[] = [];
  protected runFrames: Texture[] = [];
  protected attackFrames: Texture[] = [];
  protected dieFrames: Texture[] = [];

  constructor() {
    super();
    this.frameWidth = CRAB_FRAME_WIDTH;
    this.frameHeight = CRAB_FRAME_HEIGHT;
  }

  init(texture: Texture): void {
    const film = new TextureFilm(texture.width, texture.height, CRAB_FRAME_WIDTH, CRAB_FRAME_HEIGHT);

    this.idleFrames = this.createFrames(texture, film, 0, 0, 0, 0, 0, 0, 0);
    this.runFrames = this.createFrames(texture, film, 0, 1, 2, 3, 4, 5);
    this.attackFrames = this.createFrames(texture, film, 6, 7, 8, 9);
    this.dieFrames = this.createFrames(texture, film, 10, 11, 12, 13);

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
