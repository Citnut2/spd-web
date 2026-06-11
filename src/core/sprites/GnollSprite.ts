// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.GnollSprite

import { MobSprite } from './MobSprite';
import { Texture } from 'pixi.js';
import { TextureFilm } from '../rendering/TextureFilm';

const GNOLL_FRAME_WIDTH = 12;
const GNOLL_FRAME_HEIGHT = 15;

export class GnollSprite extends MobSprite {
  protected idleFrames: Texture[] = [];
  protected runFrames: Texture[] = [];
  protected attackFrames: Texture[] = [];
  protected dieFrames: Texture[] = [];

  constructor() {
    super();
    this.frameWidth = GNOLL_FRAME_WIDTH;
    this.frameHeight = GNOLL_FRAME_HEIGHT;
  }

  init(texture: Texture): void {
    const film = new TextureFilm(texture.width, texture.height, GNOLL_FRAME_WIDTH, GNOLL_FRAME_HEIGHT);

    this.idleFrames = this.createFrames(texture, film, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    this.runFrames = this.createFrames(texture, film, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
    this.attackFrames = this.createFrames(texture, film, 12, 13, 14, 15);
    this.dieFrames = this.createFrames(texture, film, 16, 17, 18, 19);

    this.createAnimSprite(this.idleFrames);
    const s = this.animSprite!;
    s.loop = true;
    s.animationSpeed = 3;
  }
}
