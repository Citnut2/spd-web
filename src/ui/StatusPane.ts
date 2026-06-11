import { Container, Graphics, Text } from 'pixi.js';
import { makeText } from './text';
import { Hero } from '../core/hero/Hero';
import { Dungeon } from '../core/levels/Dungeon';

const BAR_WIDTH = 50;
const BAR_HEIGHT = 6;
const PAD = 2;

export class StatusPane extends Container {
  private hero: Hero | null;

  private hpBar: Graphics;
  private hpFill: Graphics;
  private hpText: Text;
  private expBar: Graphics;
  private expFill: Graphics;
  private expText: Text;
  private levelText: Text;
  private goldText: Text;
  private nameText: Text;
  private classText: Text;
  private depthText: Text;

  constructor(hero: Hero | null) {
    super();
    this.hero = hero;
    this.eventMode = 'none';

    this.hpBar = new Graphics();
    this.hpFill = new Graphics();
    this.hpText = makeText({ text: '', size: 5, fill: '#ffffff' });
    this.expBar = new Graphics();
    this.expFill = new Graphics();
    this.expText = makeText({ text: '', size: 4, fill: '#ffffff' });
    this.levelText = makeText({ text: '', size: 5, fill: '#ffff00' });
    this.goldText = makeText({ text: '', size: 5, fill: '#ffcc00' });
    this.nameText = makeText({ text: '', size: 5, fill: '#ffffff' });
    this.classText = makeText({ text: '', size: 4, fill: '#aaaaaa' });
    this.depthText = makeText({ text: '', size: 4, fill: '#888888' });

    this.addChild(this.hpBar, this.hpFill, this.hpText);
    this.addChild(this.expBar, this.expFill, this.expText);
    this.addChild(this.levelText, this.goldText, this.nameText, this.classText, this.depthText);

    this.refresh();
  }

  refresh(): void {
    const h = this.hero;
    if (!h) return;
    const hpRatio = h.HT > 0 ? h.HP / h.HT : 0;
    const expRatio = h.maxExp > 0 ? h.exp / h.maxExp : 0;

    // HP bar background
    this.hpBar.clear();
    this.hpBar.rect(0, 0, BAR_WIDTH, BAR_HEIGHT);
    this.hpBar.fill({ color: 0x333333 });

    // HP bar fill
    const hpW = Math.max(0, Math.round(BAR_WIDTH * hpRatio));
    this.hpFill.clear();
    this.hpFill.rect(0, 0, hpW, BAR_HEIGHT);
    const hpColor = hpRatio > 0.3 ? 0x00cc00 : hpRatio > 0.1 ? 0xccaa00 : 0xcc0000;
    this.hpFill.fill({ color: hpColor });

    // HP text
    this.hpText.text = `${h.HP}/${h.HT}`;
    this.hpText.x = BAR_WIDTH / 2 - this.hpText.width / 2;
    this.hpText.y = BAR_HEIGHT / 2 - this.hpText.height / 2;

    // EXP bar
    this.expBar.clear();
    this.expBar.rect(0, BAR_HEIGHT + PAD, BAR_WIDTH, BAR_HEIGHT);
    this.expBar.fill({ color: 0x333333 });

    const expW = Math.max(0, Math.round(BAR_WIDTH * expRatio));
    this.expFill.clear();
    this.expFill.rect(0, BAR_HEIGHT + PAD, expW, BAR_HEIGHT);
    this.expFill.fill({ color: 0x4488ff });

    // EXP text
    this.expText.text = `${h.exp}/${h.maxExp}`;
    this.expText.x = BAR_WIDTH / 2 - this.expText.width / 2;
    this.expText.y = BAR_HEIGHT + PAD + BAR_HEIGHT / 2 - this.expText.height / 2;

    // Level
    this.levelText.text = `Lv.${h.lvl}`;
    this.levelText.x = BAR_WIDTH + 8;
    this.levelText.y = 0;

    // Gold
    this.goldText.text = `$${h.gold}`;
    this.goldText.x = BAR_WIDTH + 8;
    this.goldText.y = this.levelText.height + 1;

    // Name + class
    const heroClassStr = String(h.heroClass);
    this.nameText.text = heroClassStr.charAt(0) + heroClassStr.slice(1).toLowerCase();
    this.nameText.x = BAR_WIDTH + 8;
    this.nameText.y = this.levelText.height + this.goldText.height + 2;

    this.classText.text = `Lv.${h.lvl}`;
    this.classText.x = BAR_WIDTH + 8 + this.nameText.width + 2;
    this.classText.y = this.levelText.height + this.goldText.height + 2;

    // Depth
    this.depthText.text = `D:${Dungeon.depth}`;
    this.depthText.x = BAR_WIDTH + 8;
    this.depthText.y = this.levelText.height + this.goldText.height + this.nameText.height + 3;
  }

  get contentHeight(): number {
    return this.depthText.y + this.depthText.height + 2;
  }
}
