// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite

import { MobSprite } from './MobSprite';
import { Texture } from 'pixi.js';
import { TextureFilm } from '../rendering/TextureFilm';

const GOO_FRAME_WIDTH = 24;
const GOO_FRAME_HEIGHT = 18;

export class GooSprite extends MobSprite {
  protected idleFrames: Texture[] = [];
  protected runFrames: Texture[] = [];
  protected attackFrames: Texture[] = [];
  protected dieFrames: Texture[] = [];

  constructor() {
    super();
    this.frameWidth = GOO_FRAME_WIDTH;
    this.frameHeight = GOO_FRAME_HEIGHT;
  }

  init(texture: Texture): void {
    const film = new TextureFilm(texture.width, texture.height, GOO_FRAME_WIDTH, GOO_FRAME_HEIGHT);

    this.idleFrames = this.createFrames(texture, film, 0, 0, 0, 0, 0, 0, 0);
    this.runFrames = this.createFrames(texture, film, 0, 1, 2, 3, 4, 5);
    this.attackFrames = this.createFrames(texture, film, 6, 7, 8, 9);
    this.dieFrames = this.createFrames(texture, film, 10, 11, 12, 13);

    this.createAnimSprite(this.idleFrames);
    const s = this.animSprite!;
    s.loop = true;
    s.animationSpeed = 3;
  }

  blood(): number {
    return 0xFF00FF00;
  }
}
