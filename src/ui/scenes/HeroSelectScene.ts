import { Graphics } from 'pixi.js';
import { Scene } from '../Scene';
import { ViewportManager } from '../../core/engine/ViewportManager';
import { makeText } from '../text';

const CLASSES = ['WARRIOR', 'MAGE', 'ROGUE', 'HUNTRESS', 'DUELIST', 'CLERIC'];

export class HeroSelectScene extends Scene {
  private selectedClass = 'WARRIOR';

  async create(): Promise<void> {
    const W = ViewportManager.BASE_WIDTH;
    const H = ViewportManager.BASE_HEIGHT;

    // ── Background ──
    const bg = new Graphics();
    bg.rect(0, 0, W, H).fill({ color: 0x0a0a0f });
    this.container.addChild(bg);

    // ── Title ──
    const title = makeText({ text: 'SELECT HERO', size: 7, fill: '#ffcc00' });
    title.anchor.set(0.5, 0);
    title.x = Math.round(W / 2);
    title.y = 8;
    this.container.addChild(title);

    // ── Class buttons ──
    CLASSES.forEach((cls, i) => {
      const y = 24 + i * 16;
      const isSelected = cls === this.selectedClass;

      if (isSelected) {
        const highlight = new Graphics();
        highlight.rect(Math.round(W / 2 - 32), y - 1, 64, 10).fill({ color: 0x444422, alpha: 0.5 });
        this.container.addChild(highlight);
      }

      const btn = makeText({ text: `  ${cls}  `, size: 6, fill: isSelected ? '#ffff00' : '#888888' });
      btn.anchor.set(0.5, 0);
      btn.x = Math.round(W / 2);
      btn.y = Math.round(y);
      btn.eventMode = 'static';
      btn.cursor = 'pointer';
      btn.on('pointerdown', () => {
        this.selectedClass = cls;
        this.container.removeChildren();
        this.create();
      });
      this.container.addChild(btn);
    });

    // ── Start Game button ──
    const startBtn = makeText({ text: '== Start Game ==', size: 7, fill: '#44ff44' });
    startBtn.anchor.set(0.5, 0);
    startBtn.x = Math.round(W / 2);
    startBtn.y = Math.round(H - 20);
    startBtn.eventMode = 'static';
    startBtn.cursor = 'pointer';
    startBtn.on('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('spd:scene', {
        detail: { scene: 'game', heroClass: this.selectedClass },
      }));
    });
    this.container.addChild(startBtn);

    // ── Back button ──
    const backBtn = makeText({ text: '[ Back ]', size: 5, fill: '#aaaaaa' });
    backBtn.x = 2;
    backBtn.y = Math.round(H - 10);
    backBtn.eventMode = 'static';
    backBtn.cursor = 'pointer';
    backBtn.on('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('spd:scene', { detail: { scene: 'title' } }));
    });
    this.container.addChild(backBtn);
  }
}
