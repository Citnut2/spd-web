import { Assets, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { Scene } from '../Scene';
import { Renderer } from '../../core/engine/Renderer';
import { makeText } from '../text';

export class TitleScene extends Scene {
  async create(): Promise<void> {
    const W = Renderer.VIRTUAL_WIDTH;
    const H = Renderer.VIRTUAL_HEIGHT;

    // ── Dark background ──
    const bg = new Graphics();
    bg.rect(0, 0, W, H).fill({ color: 0x0a0a0f });
    this.container.addChild(bg);

    // ── Title banner from spritesheet ──
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
      this.container.addChild(titleSpr);

      const glowTex = new Texture({
        source: fullTex.source,
        frame: new Rectangle(139, 0, 139, 100),
      });
      const glowSpr = new Sprite(glowTex);
      glowSpr.scale.set(s);
      glowSpr.x = titleSpr.x;
      glowSpr.y = titleSpr.y;
      this.container.addChild(glowSpr);
    } catch {
      const titleTxt = makeText({ text: 'SHATTERED\nPIXEL DUNGEON', size: 8, fill: '#ffffff' });
      titleTxt.anchor.set(0.5, 0);
      titleTxt.x = W / 2;
      titleTxt.y = 32;
      this.container.addChild(titleTxt);
    }

    // ── Buttons ──
    this.addButton('New Game', W / 2, 68, () => {
      window.dispatchEvent(new CustomEvent('spd:scene', { detail: { scene: 'heroSelect' } }));
    });
    this.addButton('Settings', W / 2, 80, () => {
      console.log('Settings — TODO');
    });
    this.addButton('Rankings', W / 2, 92, () => {
      console.log('Rankings — TODO');
    });
    this.addButton('About', W / 2, 104, () => {
      console.log('About — TODO');
    });

    // Version text
    const ver = makeText({ text: 'v3.3.5 · Web Port', size: 5, fill: '#555555' });
    ver.x = Math.round(W - ver.width - 2);
    ver.y = Math.round(H - ver.height - 2);
    this.container.addChild(ver);
  }

  private addButton(label: string, x: number, y: number, onClick: () => void): void {
    const btn = makeText({ text: `[ ${label} ]`, size: 6, fill: '#ffff00' });
    btn.anchor.set(0.5, 0);
    btn.x = Math.round(x);
    btn.y = Math.round(y);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    this.container.addChild(btn);
  }
}
