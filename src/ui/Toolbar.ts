import { Container, Graphics } from 'pixi.js';
import { makeText } from './text';

export const TOOLBAR_WIDTH = 60;
export const TOOLBAR_HEIGHT = 14;

export class Toolbar extends Container {
  private onMenu: (() => void) | null = null;

  constructor() {
    super();
    this.eventMode = 'none';

    const bg = new Graphics();
    bg.rect(0, 0, TOOLBAR_WIDTH, TOOLBAR_HEIGHT);
    bg.fill({ color: 0x222222, alpha: 0.8 });
    bg.stroke({ color: 0x666666, width: 1 });
    this.addChild(bg);

    const menuBtn = new Container();
    menuBtn.eventMode = 'static';
    menuBtn.cursor = 'pointer';
    menuBtn.x = 2;
    menuBtn.y = 2;

    const menuBg = new Graphics();
    menuBg.rect(0, 0, 18, 10);
    menuBg.fill({ color: 0x444444 });
    menuBtn.addChild(menuBg);

    const menuT = makeText({ text: 'Menu', size: 5, fill: '#ffffff' });
    menuT.x = 2;
    menuT.y = 1;
    menuBtn.addChild(menuT);

    menuBtn.on('pointerdown', () => {
      if (this.onMenu) this.onMenu();
    });
    this.addChild(menuBtn);
  }

  setMenuCallback(cb: () => void): void {
    this.onMenu = cb;
  }

  setEnabled(_enabled: boolean): void {
    // no-op for now
  }
}
