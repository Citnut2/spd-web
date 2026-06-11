import { Container, Graphics } from 'pixi.js';
import { makeText } from './text';
import type { Hero } from '../core/hero/Hero';

const SLOT_SIZE = 10;
const GAP = 1;
const ROWS = 2;
const COLS = 4;
const PAD = 2;

export const INVENTORY_PANEL_WIDTH = COLS * (SLOT_SIZE + GAP) + PAD * 2;
export const INVENTORY_PANEL_HEIGHT = ROWS * (SLOT_SIZE + GAP) + PAD * 2;

export class InventoryPanel extends Container {
  private hero: Hero | null;

  constructor(hero: Hero | null) {
    super();
    this.hero = hero;
    this.eventMode = 'none';
    this.build();
  }

  private build(): void {
    const h = this.hero;
    if (!h) return;

    const bg = new Graphics();
    bg.rect(0, 0, INVENTORY_PANEL_WIDTH, INVENTORY_PANEL_HEIGHT);
    bg.fill({ color: 0x111111, alpha: 0.75 });
    bg.stroke({ color: 0x555555, width: 1 });
    this.addChild(bg);

    const slots: { label: string; color: number; item: any }[] = [];

    if (h.belongings.weapon) slots.push({ label: 'W', color: 0x885533, item: h.belongings.weapon });
    if (h.belongings.armor) slots.push({ label: 'A', color: 0x336688, item: h.belongings.armor });
    if (h.belongings.ring) slots.push({ label: 'R', color: 0x8866aa, item: h.belongings.ring });
    if (h.belongings.artifact) slots.push({ label: 'Ar', color: 0x66aa44, item: h.belongings.artifact });
    if (h.belongings.misc) slots.push({ label: 'M', color: 0x669966, item: h.belongings.misc });

    let idx = 0;
    for (const slot of slots) {
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
