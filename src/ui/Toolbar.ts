import { Container, Sprite, Graphics, Texture, Assets, Rectangle } from 'pixi.js';
import { QuickSlotButton } from './QuickSlotButton';
import type { Hero } from '../core/hero/Hero';
import type { Item } from '../core/items/Item';

export const TOOLBAR_TEX = 'assets/interfaces/toolbar.png';

const F = {
  inventory: { x: 0, y: 0, w: 24, h: 26 },
  wait: { x: 24, y: 0, w: 20, h: 26 },
  search: { x: 44, y: 0, w: 20, h: 26 },
  iconInventory: { x: 160, y: 0, w: 16, h: 16 },
  iconWait: { x: 176, y: 0, w: 16, h: 16 },
  iconSearch: { x: 192, y: 0, w: 16, h: 16 },
};

export const TOOLBAR_WIDTH = 24 + 20 + 20 + 4 * 22;
export const TOOLBAR_HEIGHT = 26;

const QUICK_COUNT = 4;
const QUICK_W = 22;

function subTex(tex: Texture, def: { x: number; y: number; w: number; h: number }): Texture {
  return new Texture({ source: tex.source, frame: new Rectangle(def.x, def.y, def.w, def.h) });
}

function makeButton(tex: Texture, bgDef: { x: number; y: number; w: number; h: number }, iconDef: { x: number; y: number; w: number; h: number }): Container {
  const c = new Container();
  c.eventMode = 'static';
  c.cursor = 'pointer';

  const bg = new Sprite(subTex(tex, bgDef));
  bg.label = 'bg';
  c.addChild(bg);

  const icon = new Sprite(subTex(tex, iconDef));
  icon.label = 'icon';
  icon.anchor.set(0.5);
  icon.x = bgDef.w / 2;
  icon.y = bgDef.h / 2;
  c.addChild(icon);

  const overlay = new Graphics();
  overlay.label = 'pressOverlay';
  overlay.rect(0, 0, bgDef.w, bgDef.h);
  overlay.fill({ color: 0xffffff, alpha: 0.35 });
  overlay.visible = false;
  c.addChild(overlay);

  c.on('pointerdown', () => { overlay.visible = true; });
  c.on('pointerup', () => { overlay.visible = false; });
  c.on('pointerupoutside', () => { overlay.visible = false; });

  return c;
}

export class Toolbar extends Container {
  private btnWait: Container;
  private btnSearch: Container;
  private btnInventory: Container;
  private btnQuick: QuickSlotButton[];

  private _onWait: (() => void) | null = null;
  private _onSearch: (() => void) | null = null;
  private _onInventory: (() => void) | null = null;
  private _onQuickSlot: ((item: Item) => void) | null = null;

  private static _tex: Texture | null = null;

  static async preload(): Promise<void> {
    if (Toolbar._tex) return;
    Toolbar._tex = await Assets.load(TOOLBAR_TEX);
  }

  constructor() {
    super();
    this.eventMode = 'none';

    const tex = Toolbar._tex;
    if (!tex) throw new Error('Toolbar: texture not preloaded — call Toolbar.preload() first');

    this.btnInventory = makeButton(tex, F.inventory, F.iconInventory);
    this.btnSearch = makeButton(tex, F.search, F.iconSearch);
    this.btnWait = makeButton(tex, F.wait, F.iconWait);

    this.btnInventory.on('pointerdown', () => { if (this._onInventory) this._onInventory(); });
    this.btnSearch.on('pointerdown', () => { if (this._onSearch) this._onSearch(); });
    this.btnWait.on('pointerdown', () => { if (this._onWait) this._onWait(); });

    this.addChild(this.btnInventory, this.btnSearch, this.btnWait);

    this.btnQuick = [];
    for (let i = 0; i < QUICK_COUNT; i++) {
      const qb = new QuickSlotButton(i, (item: Item) => {
        if (this._onQuickSlot) this._onQuickSlot(item);
      });
      this.btnQuick.push(qb);
      this.addChild(qb);
    }

    this.doLayout();
  }

  setCallbacks(opts: {
    onWait?: () => void;
    onSearch?: () => void;
    onInventory?: () => void;
    onQuickSlot?: (item: Item) => void;
  }): void {
    if (opts.onWait) this._onWait = opts.onWait;
    if (opts.onSearch) this._onSearch = opts.onSearch;
    if (opts.onInventory) this._onInventory = opts.onInventory;
    if (opts.onQuickSlot) this._onQuickSlot = opts.onQuickSlot;
  }

  setEnabled(enabled: boolean): void {
    const alpha = enabled ? 1 : 0.4;
    this.btnWait.alpha = alpha;
    this.btnSearch.alpha = alpha;
    this.btnInventory.alpha = alpha;
    for (const qb of this.btnQuick) {
      qb.setEnabled(enabled);
    }
    this.eventMode = enabled ? 'static' : 'none';
  }

  refreshSlots(hero: Hero | null): void {
    if (!hero) return;
    for (let i = 0; i < QUICK_COUNT; i++) {
      const item = hero.belongings.backpack.items[i] ?? null;
      this.btnQuick[i]!.setItem(item);
    }
  }

  setQuickSlotItem(slot: number, item: Item | null): void {
    if (slot >= 0 && slot < QUICK_COUNT) {
      this.btnQuick[slot]!.setItem(item);
    }
  }

  private doLayout(): void {
    const quickW = QUICK_W;

    this.btnWait.x = 0;
    this.btnWait.y = 0;
    this.btnSearch.x = F.wait.w;
    this.btnSearch.y = 0;

    const quickStartX = F.wait.w + F.search.w;
    for (let i = 0; i < QUICK_COUNT; i++) {
      this.btnQuick[i]!.x = quickStartX + i * quickW + 2;
      this.btnQuick[i]!.y = 1;
    }

    this.btnInventory.x = quickStartX + QUICK_COUNT * quickW + 4;
    this.btnInventory.y = 0;
  }
}
