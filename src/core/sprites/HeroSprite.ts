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

// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite

import { CharSprite } from './CharSprite';
import { TextureFilm } from '../rendering/TextureFilm';
import { Texture } from 'pixi.js';

const FRAME_WIDTH = 12;
const FRAME_HEIGHT = 15;

export class HeroSprite extends CharSprite {
  protected idleFrames: Texture[] = [];
  protected runFrames: Texture[] = [];
  protected attackFrames: Texture[] = [];
  protected dieFrames: Texture[] = [];
  protected operateFrames: Texture[] = [];

  constructor() {
    super();
    this.frameWidth = FRAME_WIDTH;
    this.frameHeight = FRAME_HEIGHT;
  }

  init(texture: Texture): void {
    const film = new TextureFilm(texture.width, texture.height, FRAME_WIDTH, FRAME_HEIGHT);

    this.idleFrames = this.createFrames(texture, film, 0, 0, 0, 1, 0, 0, 1, 1);
    this.runFrames = this.createFrames(texture, film, 2, 3, 4, 5, 6, 7);
    this.dieFrames = this.createFrames(texture, film, 8, 9, 10, 11, 12, 11);
    this.attackFrames = this.createFrames(texture, film, 13, 14, 15, 0);
    this.operateFrames = this.createFrames(texture, film, 16, 17, 16, 17);

    this.createAnimSprite(this.idleFrames);
    const s = this.animSprite!;
    s.loop = true;
    s.animationSpeed = 1;
  }

  place(cell: number, mapWidth: number): void {
    super.place(cell, mapWidth);
  }

  updateSprite(mapWidth?: number): void {
    if (!this.ch) return;
    this.place(this.ch.pos, mapWidth ?? this.mapWidth);
  }

  idle(): void {
    const s = this.animSprite;
    if (s && this.idleFrames.length > 0) {
      s.textures = this.idleFrames;
      s.loop = true;
      s.animationSpeed = 1;
      s.play();
    }
  }
}
