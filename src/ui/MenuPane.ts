import { Container, Assets, Sprite, Texture, Rectangle } from 'pixi.js';
import { Dungeon } from '../core/levels/Dungeon';
import { makeText } from './text';

const MENU_TEX = 'assets/interfaces/menu_pane.png';
const MENU_BTN_TEX = 'assets/interfaces/menu_button.png';

export const MENU_PANE_WIDTH = 31;
export const MENU_PANE_HEIGHT = 38;

export class MenuPane extends Container {
  private depthText: ReturnType<typeof makeText>;
  private journalBtn: Container;
  private menuBtn: Container;
  private onOpenMenu: (() => void) | null = null;

  constructor(onOpenMenu: () => void) {
    super();
    this.onOpenMenu = onOpenMenu;
    this.eventMode = 'none';

    const bgTex = Assets.get(MENU_TEX) as Texture | undefined;
    if (bgTex) {
      const bg = new Sprite(new Texture({ source: bgTex.source, frame: new Rectangle(1, 0, 31, 21) }));
      this.addChild(bg);
    }

    this.depthText = makeText({ text: '', size: 5, fill: '#CACFC2' });
    this.addChild(this.depthText);

    const btnTex = Assets.get(MENU_BTN_TEX) as Texture | undefined;

    this.journalBtn = new Container();
    this.journalBtn.eventMode = 'static';
    this.journalBtn.cursor = 'pointer';
    if (btnTex) {
      const jBg = new Sprite(new Texture({ source: btnTex.source, frame: new Rectangle(2, 2, 13, 11) }));
      this.journalBtn.addChild(jBg);
      const jIcon = new Sprite(new Texture({ source: btnTex.source, frame: new Rectangle(31, 0, 11, 6) }));
      jIcon.x = (13 - 11) / 2;
      jIcon.y = (11 - 6) / 2;
      this.journalBtn.addChild(jIcon);
    }
    this.journalBtn.on('pointerdown', () => {
      // open journal (stub: logs for now)
    });
    this.addChild(this.journalBtn);

    this.menuBtn = new Container();
    this.menuBtn.eventMode = 'static';
    this.menuBtn.cursor = 'pointer';
    if (btnTex) {
      const mBg = new Sprite(new Texture({ source: btnTex.source, frame: new Rectangle(17, 2, 12, 11) }));
      this.menuBtn.addChild(mBg);
    }
    this.menuBtn.on('pointerdown', () => {
      if (this.onOpenMenu) this.onOpenMenu();
    });
    this.addChild(this.menuBtn);

    this.doLayout();
  }

  private doLayout(): void {
    this.journalBtn.x = MENU_PANE_WIDTH - this.menuBtn.width - this.journalBtn.width + 4;
    this.journalBtn.y = 0;

    this.menuBtn.x = MENU_PANE_WIDTH - this.menuBtn.width;
    this.menuBtn.y = 0;

    this.depthText.x = this.journalBtn.x - 18;
    this.depthText.y = 4;
  }

  refresh(): void {
    this.depthText.text = String(Dungeon.depth);
  }
}
