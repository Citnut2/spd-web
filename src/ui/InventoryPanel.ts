import { Container, Graphics } from 'pixi.js';
import { makeText } from './text';
import type { Hero } from '../core/hero/Hero';

const SLOT_SIZE = 12;
const GAP = 1;
const ROWS = 2;
const COLS = 4;
const PAD = 2;
const BTN_H = 14;

export const INVENTORY_PANEL_WIDTH = COLS * (SLOT_SIZE + GAP) + PAD * 2;
export const INVENTORY_PANEL_HEIGHT = PAD + ROWS * (SLOT_SIZE + GAP) + PAD + 2 + BTN_H + PAD;

export class InventoryPanel extends Container {
  private hero: Hero | null;

  private onSearch: (() => void) | null = null;
  private onWait: (() => void) | null = null;
  private onInventory: (() => void) | null = null;

  constructor(hero: Hero | null) {
    super();
    this.hero = hero;
    this.eventMode = 'none';
    this.build();
  }

  setCallbacks(opts: {
    onWait?: () => void;
    onInventory?: () => void;
    onSearch?: () => void;
  }): void {
    if (opts.onWait) this.onWait = opts.onWait;
    if (opts.onInventory) this.onInventory = opts.onInventory;
    if (opts.onSearch) this.onSearch = opts.onSearch;
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

    // Framed background
    const bg = new Graphics();
    bg.rect(0, 0, W, H);
    bg.fill({ color: 0x111111, alpha: 0.88 });
    bg.stroke({ color: 0x888888, width: 1 });
    this.addChild(bg);

    // Equipment slots grid
    const equipOrder: { label: string; color: number; item: boolean }[] = [];
    if (h.belongings.weapon) equipOrder.push({ label: 'W', color: 0x885533, item: true });
    if (h.belongings.armor) equipOrder.push({ label: 'A', color: 0x336688, item: true });
    if (h.belongings.ring) equipOrder.push({ label: 'R', color: 0x8866aa, item: true });
    if (h.belongings.artifact) equipOrder.push({ label: 'Ar', color: 0x66aa44, item: true });
    if (h.belongings.misc) equipOrder.push({ label: 'M', color: 0x669966, item: true });

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

    // Separator
    const sepY = PAD + ROWS * (SLOT_SIZE + GAP) + 1;
    const sep = new Graphics();
    sep.rect(PAD, sepY, W - PAD * 2, 1);
    sep.fill({ color: 0x666666 });
    this.addChild(sep);

    // Bottom toolbar: Search | Wait | Inventory
    const btnY = sepY + 3;
    const btnW = 20;
    const btnH = BTN_H;
    const totalBtnW = btnW * 3 + 2;
    const btnStartX = Math.round((W - totalBtnW) / 2);

    // Try to load toolbar.png for icons
    this.makeToolbarButton(btnStartX, btnY, btnW, btnH, 'Search', 0x448844, this.onSearch);
    this.makeToolbarButton(btnStartX + btnW + 1, btnY, btnW, btnH, 'Wait', 0x666688, this.onWait);
    this.makeToolbarButton(btnStartX + (btnW + 1) * 2, btnY, btnW, btnH, 'Bag', 0x886644, this.onInventory);
  }

  private makeToolbarButton(x: number, y: number, w: number, h: number, label: string, color: number, cb: (() => void) | null): void {
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.x = x;
    c.y = y;

    const bg = new Graphics();
    bg.rect(0, 0, w, h);
    bg.fill({ color });
    c.addChild(bg);

    const t = makeText({ text: label, size: 5, fill: '#ffffff' });
    t.x = w / 2 - t.width / 2;
    t.y = h / 2 - t.height / 2;
    c.addChild(t);

    if (cb) {
      c.on('pointerdown', cb);
    }

    this.addChild(c);
  }
}
