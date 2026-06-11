import { Container, Graphics } from 'pixi.js';
import { makeText } from './text';

export class Toolbar extends Container {
  private btnWait: Container;
  private btnInventory: Container;
  private btnSearch: Container;

  private onWait: (() => void) | null = null;
  private onInventory: (() => void) | null = null;
  private onSearch: (() => void) | null = null;

  /** Virtual y-offset from bottom of screen */
  static readonly HEIGHT = 14;

  constructor() {
    super();
    this.eventMode = 'none';

    this.btnWait = this.makeButton('Wait', 0x444466);
    this.btnSearch = this.makeButton('Sear', 0x446644);
    this.btnInventory = this.makeButton('Bag', 0x664444);

    this.addChild(this.btnWait, this.btnSearch, this.btnInventory);
    this.layout();
  }

  private makeButton(label: string, color: number): Container {
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';

    const bg = new Graphics();
    bg.rect(0, 0, 20, Toolbar.HEIGHT);
    bg.fill({ color });
    c.addChild(bg);

    const t = makeText({ text: label, size: 6, fill: '#ffffff' });
    t.x = 10 - t.width / 2;
    t.y = Toolbar.HEIGHT / 2 - t.height / 2;
    c.addChild(t);

    c.on('pointerdown', () => {
      bg.tint = 0x888888;
    });
    c.on('pointerup', () => {
      bg.tint = 0xffffff;
    });
    c.on('pointerupoutside', () => {
      bg.tint = 0xffffff;
    });

    return c;
  }

  private layout(): void {
    let x = 2;
    for (const btn of [this.btnWait, this.btnSearch, this.btnInventory]) {
      btn.x = x;
      btn.y = 0;
      x += 22;
    }
  }

  setCallbacks(opts: {
    onWait?: () => void;
    onInventory?: () => void;
    onSearch?: () => void;
  }): void {
    if (opts.onWait) {
      this.onWait = opts.onWait;
      this.btnWait.on('pointerdown', this.onWait);
    }
    if (opts.onInventory) {
      this.onInventory = opts.onInventory;
      this.btnInventory.on('pointerdown', this.onInventory);
    }
    if (opts.onSearch) {
      this.onSearch = opts.onSearch;
      this.btnSearch.on('pointerdown', this.onSearch);
    }
  }

  setEnabled(enabled: boolean): void {
    for (const btn of [this.btnWait, this.btnSearch, this.btnInventory]) {
      btn.alpha = enabled ? 1 : 0.5;
      btn.eventMode = enabled ? 'static' : 'none';
    }
  }
}
