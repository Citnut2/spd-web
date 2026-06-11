import { Assets, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { Scene } from '../Scene';
import { ViewportManager } from '../../core/engine/ViewportManager';
import { makeText } from '../text';

export class TitleScene extends Scene {
  private buttons: Array<{ label: string; y: number; onClick: () => void }> = [];
  private titleElements: { bg?: Graphics; title?: Sprite; glow?: Sprite; fallback?: ReturnType<typeof makeText>; ver?: ReturnType<typeof makeText> } = {};

  async create(): Promise<void> {
    const W = ViewportManager.BASE_WIDTH;
    const H = ViewportManager.BASE_HEIGHT;

    const bg = new Graphics();
    bg.rect(0, 0, W, H).fill({ color: 0x0a0a0f });
    this.titleElements.bg = bg;
    this.container.addChild(bg);

    try {
      const fullTex = await Assets.load('assets/interfaces/banners.png');
      const titleTex = new Texture({
        source: fullTex.source,
        frame: new Rectangle(0, 0, 139, 100),
      });
      const titleSpr = new Sprite(titleTex);
      const s = 55 / 100;
      titleSpr.scale.set(s);
      titleSpr.x = Math.round((W - 139 * s) / 2);
      titleSpr.y = 10;
      this.titleElements.title = titleSpr;
      this.container.addChild(titleSpr);

      const glowTex = new Texture({
        source: fullTex.source,
        frame: new Rectangle(139, 0, 139, 100),
      });
      const glowSpr = new Sprite(glowTex);
      glowSpr.scale.set(s);
      glowSpr.x = titleSpr.x;
      glowSpr.y = titleSpr.y;
      this.titleElements.glow = glowSpr;
      this.container.addChild(glowSpr);
    } catch {
      const titleTxt = makeText({ text: 'SHATTERED\nPIXEL DUNGEON', size: 8, fill: '#ffffff' });
      titleTxt.anchor.set(0.5, 0);
      titleTxt.x = W / 2;
      titleTxt.y = 32;
      this.titleElements.fallback = titleTxt;
      this.container.addChild(titleTxt);
    }

    this.buttons = [
      { label: 'New Game', y: 68, onClick: () => {
        window.dispatchEvent(new CustomEvent('spd:scene', { detail: { scene: 'heroSelect' } }));
      }},
      { label: 'Settings', y: 80, onClick: () => console.log('Settings — TODO') },
      { label: 'Rankings', y: 92, onClick: () => console.log('Rankings — TODO') },
      { label: 'About', y: 104, onClick: () => console.log('About — TODO') },
    ];

    for (const btn of this.buttons) {
      const el = this.addButton(btn.label, W / 2, btn.y, btn.onClick);
      this.container.addChild(el);
    }

    const ver = makeText({ text: 'v3.3.5 · Web Port', size: 5, fill: '#555555' });
    ver.x = Math.round(W - ver.width - 2);
    ver.y = Math.round(H - ver.height - 2);
    this.titleElements.ver = ver;
    this.container.addChild(ver);
  }

  private addButton(label: string, x: number, y: number, onClick: () => void): ReturnType<typeof makeText> {
    const btn = makeText({ text: `[ ${label} ]`, size: 6, fill: '#ffff00' });
    btn.anchor.set(0.5, 0);
    btn.x = Math.round(x);
    btn.y = Math.round(y);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    return btn;
  }

  onResize(_viewport: ViewportManager): void {
    // Title scene is centered automatically via root scaling
  }
}
