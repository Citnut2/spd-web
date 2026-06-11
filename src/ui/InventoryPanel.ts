import { Container, Graphics } from 'pixi.js';
import { makeText } from './text';
import type { Hero } from '../core/hero/Hero';

const SLOT_SIZE = 12;
const GAP = 1;
const ROWS = 2;
const COLS = 4;
const PAD = 2;

export const INVENTORY_PANEL_WIDTH = COLS * (SLOT_SIZE + GAP) + PAD * 2;
export const INVENTORY_PANEL_HEIGHT = PAD + ROWS * (SLOT_SIZE + GAP) + PAD;

export class InventoryPanel extends Container {
  private hero: Hero | null;

  constructor(hero: Hero | null) {
    super();
    this.hero = hero;
    this.eventMode = 'none';
    this.build();
  }

  refresh(): void {
    this.removeChildren();
    this.build();
  }

  private build(): void {
    const h = this.hero;
    if (!h) return;

    const W = INVENTORY_PANEL_WIDTH;
    const H = INVENTORY_PANEL_HEIGHT;

    const bg = new Graphics();
    bg.rect(0, 0, W, H);
    bg.fill({ color: 0x111111, alpha: 0.88 });
    bg.stroke({ color: 0x888888, width: 1 });
    this.addChild(bg);

    const equipOrder: { label: string; color: number }[] = [];
    if (h.belongings.weapon) equipOrder.push({ label: 'W', color: 0x885533 });
    if (h.belongings.armor) equipOrder.push({ label: 'A', color: 0x336688 });
    if (h.belongings.ring) equipOrder.push({ label: 'R', color: 0x8866aa });
    if (h.belongings.artifact) equipOrder.push({ label: 'Ar', color: 0x66aa44 });
    if (h.belongings.misc) equipOrder.push({ label: 'M', color: 0x669966 });

    let idx = 0;
    for (const slot of equipOrder) {
      if (idx >= ROWS * COLS) break;
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const sx = PAD + col * (SLOT_SIZE + GAP);
      const sy = PAD + row * (SLOT_SIZE + GAP);

      const cell = new Graphics();
      cell.rect(sx, sy, SLOT_SIZE, SLOT_SIZE);
      cell.fill({ color: slot.color });
      this.addChild(cell);

      const t = makeText({ text: slot.label, size: 5, fill: '#ffffff' });
      t.x = sx + SLOT_SIZE / 2 - t.width / 2;
      t.y = sy + SLOT_SIZE / 2 - t.height / 2;
      this.addChild(t);

      idx++;
    }
  }
}
