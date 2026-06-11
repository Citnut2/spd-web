// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.SwarmSprite

import { MobSprite } from './MobSprite';
import { Texture } from 'pixi.js';
import { TextureFilm } from '../rendering/TextureFilm';

const SWARM_FRAME_WIDTH = 15;
const SWARM_FRAME_HEIGHT = 14;

export class SwarmSprite extends MobSprite {
  protected idleFrames: Texture[] = [];
  protected runFrames: Texture[] = [];
  protected attackFrames: Texture[] = [];
  protected dieFrames: Texture[] = [];

  constructor() {
    super();
    this.frameWidth = SWARM_FRAME_WIDTH;
    this.frameHeight = SWARM_FRAME_HEIGHT;
  }

  init(texture: Texture): void {
    const film = new TextureFilm(texture.width, texture.height, SWARM_FRAME_WIDTH, SWARM_FRAME_HEIGHT);

    this.idleFrames = this.createFrames(texture, film, 0, 0, 0, 0, 0, 0);
    this.runFrames = this.createFrames(texture, film, 0, 1, 2, 3, 4, 5);
    this.attackFrames = this.createFrames(texture, film, 0, 1, 2, 3);
    this.dieFrames = this.createFrames(texture, film, 4, 5, 6, 7);

    this.createAnimSprite(this.idleFrames);
    const s = this.animSprite!;
    s.loop = true;
    s.animationSpeed = 4;
  }

  idle(): void {
    const s = this.animSprite;
    if (s && this.idleFrames.length > 0) {
      s.textures = this.idleFrames;
      s.loop = true;
      s.animationSpeed = 4;
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
