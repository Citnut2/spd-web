import { Container, Graphics } from 'pixi.js';
import { makeText } from './text';
import type { Hero } from '../core/hero/Hero';
import { BuffType } from '../core/actors/buffs/Buff';

const ICON_SIZE = 8;
const ICON_GAP = 1;

const BUFF_COLORS: Record<string, number> = {
  Burning: 0xff4400,
  Frost: 0x88ccff,
  Chill: 0xaaddff,
  Poison: 0x44ff44,
  Paralysis: 0xffff44,
  Haste: 0x88ff88,
  Invisibility: 0xccccff,
  Levitation: 0xaaccff,
  MindVision: 0x4488ff,
  Bless: 0xffffff,
  Amok: 0xff4488,
  Terror: 0x664488,
  MagicalSleep: 0x8888ff,
  Hunger: 0xccaa44,
  Regeneration: 0x44ff44,
};

export class BuffIndicator extends Container {
  private hero: Hero | null;

  constructor(hero: Hero | null) {
    super();
    this.hero = hero;
    this.eventMode = 'none';
  }

  setHero(hero: Hero | null): void {
    this.hero = hero;
    this.refresh();
  }

  refresh(): void {
    this.removeChildren();

    const h = this.hero;
    if (!h) return;

    let x = 0;
    const y = 0;

    for (const buff of h.buffs) {
      const name = buff.name();
      const color = BUFF_COLORS[name] ?? (
        buff.type === BuffType.POSITIVE ? 0x44aa44 :
        buff.type === BuffType.NEGATIVE ? 0xaa4444 :
        0x888888
      );

      const bg = new Graphics();
      bg.rect(x, y, ICON_SIZE, ICON_SIZE);
      bg.fill({ color });
      this.addChild(bg);

      const label = name.charAt(0);
      const t = makeText({ text: label, size: 5, fill: '#ffffff' });
      t.x = x + ICON_SIZE / 2 - t.width / 2;
      t.y = y + ICON_SIZE / 2 - t.height / 2;
      this.addChild(t);

      x += ICON_SIZE + ICON_GAP;
    }
  }
}
