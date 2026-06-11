// SPDX-License-Identifier: GPL-3.0-only
// Port of com.shatteredpixel.shatteredpixeldungeon.ui.Window + WndBag

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Hero } from '../../core/hero/Hero';
import { Item } from '../../core/items/Item';

export class WndBag extends Container {
  private hero: Hero;
  private onClose: (() => void) | null = null;

  static readonly WIDTH = 120;
  static readonly HEIGHT = 100;

  constructor(hero: Hero, onClose?: () => void) {
    super();
    this.hero = hero;
    this.onClose = onClose ?? null;

    this.eventMode = 'static';

    const bg = new Graphics();
    bg.roundRect(0, 0, WndBag.WIDTH, WndBag.HEIGHT, 2);
    bg.fill({ color: 0x000000, alpha: 0.85 });
    bg.stroke({ color: 0x888888, width: 1 });
    this.addChild(bg);

    const title = new Text({
      text: 'Inventory',
      style: new TextStyle({ fontFamily: 'PixelFont, monospace', fontSize: 7, fill: '#ffffff' }),
    });
    title.x = 4;
    title.y = 3;
    this.addChild(title);

    this.buildItemList();

    const closeBtn = new Graphics();
    closeBtn.roundRect(WndBag.WIDTH - 14, 2, 12, 10, 2);
    closeBtn.fill({ color: 0x664444 });
    this.addChild(closeBtn);
    const closeT = new Text({
      text: 'X',
      style: new TextStyle({ fontFamily: 'PixelFont, monospace', fontSize: 7, fill: '#ffffff' }),
    });
    closeT.x = WndBag.WIDTH - 11;
    closeT.y = 3;
    this.addChild(closeT);
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => { this.close(); });
  }

  private buildItemList(): void {
    let y = 14;
    const belongings = this.hero.belongings;

    const addItem = (label: string, item: Item | null) => {
      const name = item ? item.name() : '[empty]';
      const color = item ? '#aaaaaa' : '#555555';
      const t = new Text({
        text: `${label}: ${name}`,
        style: new TextStyle({ fontFamily: 'PixelFont, monospace', fontSize: 5, fill: color }),
      });
      t.x = 4;
      t.y = y;
      this.addChild(t);
      y += 8;
    };

    addItem('Weapon', belongings.weapon);
    addItem('Armor', belongings.armor);
    addItem('Artifact', belongings.artifact);
    addItem('Ring', belongings.ring);

    y += 4;
    const header = new Text({
      text: `Backpack (${belongings.backpack.items.length})`,
      style: new TextStyle({ fontFamily: 'PixelFont, monospace', fontSize: 5, fill: '#888888' }),
    });
    header.x = 4;
    header.y = y;
    this.addChild(header);
    y += 8;

    for (const item of belongings.backpack.items) {
      const name = item.name();
      const qty = item.itemQuantity > 1 ? ` x${item.itemQuantity}` : '';
      const t = new Text({
        text: `  ${name}${qty}`,
        style: new TextStyle({ fontFamily: 'PixelFont, monospace', fontSize: 5, fill: '#aaaaaa' }),
      });
      t.x = 4;
      t.y = y;
      this.addChild(t);
      y += 7;
      if (y > WndBag.HEIGHT - 10) break;
    }
  }

  close(): void {
    if (this.parent) {
      this.removeFromParent();
    }
    if (this.onClose) this.onClose();
  }
}
