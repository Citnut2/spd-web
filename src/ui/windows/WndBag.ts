import { Container, Graphics } from 'pixi.js';
import { Hero } from '../../core/hero/Hero';
import type { Item } from '../../core/items/Item';
import { WndUseItem } from './WndUseItem';
import { makeText } from '../text';

const WIDTH = 120;
const MAX_HEIGHT = 108;
const SLOT_H = 10;
const PAD = 2;

interface Slot {
  item: Item | null;
  label: string;
  container: Container;
}

export class WndBag extends Container {
  static readonly WIDTH = 120;
  static readonly HEIGHT = 108;

  private hero: Hero;
  private slots: Slot[] = [];

  constructor(hero: Hero) {
    super();
    this.hero = hero;
    this.eventMode = 'static';

    this.build();
  }

  private build(): void {
    const hero = this.hero;
    const belongings = hero.belongings;

    const titleStr = `Inventory (${belongings.backpack.items.length})`;
    const title = makeText({ text: titleStr, size: 7, fill: '#ffff00' });

    const equipSlots: { label: string; item: Item | null }[] = [
      { label: 'Wpn', item: belongings.weapon },
      { label: 'Arm', item: belongings.armor },
      { label: 'Art', item: belongings.artifact },
      { label: 'Rng', item: belongings.ring },
      { label: 'Msc', item: belongings.misc },
    ];

    const visibleSlots = equipSlots.filter(s => s.item !== null);
    const itemCount = belongings.backpack.items.length;
    const totalRows = 1 + (visibleSlots.length > 0 ? Math.ceil(visibleSlots.length / 2) : 0) + (itemCount > 0 ? itemCount : 0) + 1;
    const height = Math.min(MAX_HEIGHT, PAD + title.height + PAD + totalRows * (SLOT_H + 1) + PAD);

    const bg = new Graphics();
    bg.roundRect(0, 0, WIDTH, height, 2);
    bg.fill({ color: 0x000000, alpha: 0.85 });
    bg.stroke({ color: 0x888888, width: 1 });
    this.addChild(bg);

    title.x = PAD + 2;
    title.y = PAD + 1;
    this.addChild(title);

    const closeBtn = new Graphics();
    closeBtn.roundRect(WIDTH - 14, PAD, 12, 10, 2);
    closeBtn.fill({ color: 0x664444 });
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => this.close());
    this.addChild(closeBtn);

    const closeT = makeText({ text: 'X', size: 7, fill: '#ffffff' });
    closeT.x = WIDTH - 11;
    closeT.y = PAD + 1;
    this.addChild(closeT);

    let y = PAD + title.height + PAD;

    // Equipment slots in rows of 2
    if (visibleSlots.length > 0) {
      const label = makeText({ text: 'Equipped:', size: 5, fill: '#888888' });
      label.x = PAD + 2;
      label.y = y;
      this.addChild(label);
      y += SLOT_H;

      for (let i = 0; i < visibleSlots.length; i += 2) {
        const s1 = visibleSlots[i]!;
        const s2 = visibleSlots[i + 1];
        this.addSlot(s1.label, s1.item, PAD + 2, y, 56);
        if (s2) {
          this.addSlot(s2.label, s2.item, PAD + 60, y, 56);
        }
        y += SLOT_H + 1;
      }
    }

    // Backpack items
    if (itemCount > 0) {
      const label = makeText({ text: 'Backpack:', size: 5, fill: '#888888' });
      label.x = PAD + 2;
      label.y = y;
      this.addChild(label);
      y += SLOT_H;

      for (const item of belongings.backpack.items) {
        if (y + SLOT_H > height - PAD) break;
        this.addSlot(null, item, PAD + 2, y, WIDTH - 8);
        y += SLOT_H + 1;
      }
    }
  }

  private addSlot(_label: string | null, item: Item | null, x: number, y: number, w: number): void {
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.x = x;
    c.y = y;

    const bg = new Graphics();
    bg.rect(0, 0, w, SLOT_H);
    bg.fill({ color: 0x222222 });
    c.addChild(bg);

    if (item) {
      const name = item.title();
      const color = item.cursed && item.cursedKnown ? '#ff6666' : '#aaaaaa';
      const t = makeText({ text: name, size: 5, fill: color });
      t.x = 2;
      t.y = SLOT_H / 2 - t.height / 2;
      c.addChild(t);

      c.on('pointerdown', () => { bg.tint = 0x555555; });
      c.on('pointerup', () => {
        bg.tint = 0xffffff;
        this.onItemClick(item);
      });
      c.on('pointerupoutside', () => { bg.tint = 0xffffff; });
    } else {
      const t = makeText({ text: `[${_label ?? '?'}]`, size: 5, fill: '#555555' });
      t.x = 2;
      t.y = SLOT_H / 2 - t.height / 2;
      c.addChild(t);
    }

    this.addChild(c);
    this.slots.push({ item, label: _label ?? '', container: c });
  }

  private onItemClick(item: Item): void {
    const wnd = new WndUseItem(item, this.hero, this);
    wnd.x = this.x + WIDTH + 2;
    wnd.y = this.y;
    if (this.parent) {
      this.parent.addChild(wnd);
    }
  }

  close(): void {
    this.removeFromParent();
  }
}
