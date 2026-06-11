/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2025 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.SlimeSprite

import { MobSprite } from './MobSprite';
import { Texture } from 'pixi.js';
import { TextureFilm } from '../rendering/TextureFilm';

const SLIME_FRAME_WIDTH = 14;
const SLIME_FRAME_HEIGHT = 12;

export class SlimeSprite extends MobSprite {
  protected idleFrames: Texture[] = [];
  protected runFrames: Texture[] = [];
  protected attackFrames: Texture[] = [];
  protected dieFrames: Texture[] = [];

  constructor() {
    super();
    this.frameWidth = SLIME_FRAME_WIDTH;
    this.frameHeight = SLIME_FRAME_HEIGHT;
  }

  init(texture: Texture): void {
    const film = new TextureFilm(texture.width, texture.height, SLIME_FRAME_WIDTH, SLIME_FRAME_HEIGHT);

    this.idleFrames = this.createFrames(texture, film, 0, 1, 1, 0);
    this.runFrames = this.createFrames(texture, film, 0, 2, 3, 3, 2, 0);
    this.attackFrames = this.createFrames(texture, film, 2, 3, 4, 6, 5);
    this.dieFrames = this.createFrames(texture, film, 0, 5, 6, 7);

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

  blood(): number {
    return 0xFF88CC44;
  }
}
