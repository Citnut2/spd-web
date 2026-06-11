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

// Port of com.watabou.noosa.SkinnedBlock for water rendering
// Uses PixiJS TilingSprite with animated UV scrolling
// Matches GameScene: waterOfs -= 5 * Game.elapsed with autoAdjust wrapping

import { Container, Texture, TilingSprite } from 'pixi.js';

export class WaterRenderer extends Container {
  private sprite: TilingSprite;
  private _speed = 5;

  constructor(texture: Texture, mapPixelWidth: number, mapPixelHeight: number) {
    super();

    this.sprite = new TilingSprite({
      texture,
      width: mapPixelWidth,
      height: mapPixelHeight,
    });
    this.sprite.eventMode = 'none';
    this.sprite.blendMode = 'none';
    this.addChild(this.sprite);
  }

  get speed(): number {
    return this._speed;
  }

  set speed(v: number) {
    this._speed = v;
  }

  update(dt: number): void {
    // Match Java: waterOfs -= 5 * Game.elapsed; water.offsetTo(0, waterOfs)
    // Scrolling only Y (water surface flows upward); X stays at 0
    this.sprite.tilePosition.y -= this._speed * dt;
  }

  destroy(): void {
    this.removeFromParent();
    this.sprite.destroy({ texture: false, children: false });
    super.destroy();
  }
}

export default WaterRenderer;
