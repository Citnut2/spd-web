import { Container, Graphics, Assets, Sprite, Texture, Rectangle } from 'pixi.js';
import { makeText } from './text';
import { Hero } from '../core/hero/Hero';
import { Dungeon } from '../core/levels/Dungeon';
import { BuffIndicator } from './BuffIndicator';

const PAD = 2;
export const STATUS_PANEL_WIDTH = 96;
export const STATUS_PANEL_HEIGHT = 48;

const PORTRAIT_MAP: Record<string, number> = {
  WARRIOR: 0, MAGE: 1, ROGUE: 2,
  HUNTRESS: 3, DUELIST: 4, CLERIC: 5,
};

export class StatusPane extends Container {
  private hero: Hero | null;

  private avatar: Container;
  private hpFill: Graphics;
  private expFill: Graphics;
  private hpText: ReturnType<typeof makeText>;
  private expText: ReturnType<typeof makeText>;
  private levelText: ReturnType<typeof makeText>;
  private depthText: ReturnType<typeof makeText>;
  private nameText: ReturnType<typeof makeText>;
  private buffIndicator: BuffIndicator;

  private heroPortrait: Sprite | null = null;
  private iconTexture: Texture | null = null;

  constructor(hero: Hero | null) {
    super();
    this.hero = hero;
    this.eventMode = 'none';

    const bg = new Graphics();
    bg.rect(0, 0, STATUS_PANEL_WIDTH, STATUS_PANEL_HEIGHT);
    bg.fill({ color: 0x111111, alpha: 0.88 });
    bg.stroke({ color: 0x888888, width: 1 });
    this.addChild(bg);

    this.avatar = new Container();
    this.addChild(this.avatar);

    this.hpFill = new Graphics();
    this.addChild(this.hpFill);

    this.expFill = new Graphics();
    this.addChild(this.expFill);

    this.hpText = makeText({ text: '', size: 5, fill: '#ffffff' });
    this.expText = makeText({ text: '', size: 4, fill: '#ffffaa' });
    this.levelText = makeText({ text: '', size: 5, fill: '#ffff00' });
    this.depthText = makeText({ text: '', size: 4, fill: '#888888' });
    this.nameText = makeText({ text: '', size: 5, fill: '#ffffff' });

    this.addChild(this.hpText, this.expText, this.levelText, this.depthText, this.nameText);

    this.buffIndicator = new BuffIndicator(hero);
    this.addChild(this.buffIndicator);

    this.loadPortrait();
    this.refresh();
  }

  private async loadPortrait(): Promise<void> {
    try {
      const tex = await Assets.load('assets/interfaces/hero_icons.png');
      this.iconTexture = tex;
      const idx = PORTRAIT_MAP[this.hero?.heroClass ?? 'WARRIOR'] ?? 0;
      this.heroPortrait = new Sprite(
        new Texture({
          source: tex.source,
          frame: new Rectangle(idx * 16, 0, 16, 16),
        }),
      );
      this.heroPortrait.x = 3;
      this.heroPortrait.y = 3;
      this.addChild(this.heroPortrait);
    } catch {
      const fallback = new Graphics();
      fallback.rect(2, 2, 16, 16);
      fallback.fill({ color: 0x886644 });
      this.addChild(fallback);
    }
    this.refresh();
  }

  refresh(): void {
    const h = this.hero;
    if (!h) return;

    const portraitW = 16;

    // HP bar
    const hpRatio = h.HT > 0 ? h.HP / h.HT : 0;
    const hpBarX = portraitW + 6;
    const hpBarY = 2;
    const hpBarW = STATUS_PANEL_WIDTH - hpBarX - PAD;
    const hpBarH = 6;

    this.hpFill.clear();
    this.hpFill.rect(hpBarX, hpBarY, Math.max(1, Math.round(hpBarW * hpRatio)), hpBarH);
    const hpColor = hpRatio > 0.3 ? 0x00cc00 : hpRatio > 0.1 ? 0xccaa00 : 0xcc0000;
    this.hpFill.fill({ color: hpColor });

    // HP text
    this.hpText.text = `${h.HP}/${h.HT}`;
    this.hpText.x = hpBarX + hpBarW / 2 - this.hpText.width / 2;
    this.hpText.y = hpBarY + hpBarH / 2 - this.hpText.height / 2;

    // XP bar
    const expRatio = h.maxExp > 0 ? h.exp / h.maxExp : 0;
    const expBarY = hpBarY + hpBarH + 2;
    this.expFill.clear();
    this.expFill.rect(hpBarX, expBarY, Math.max(1, Math.round(hpBarW * expRatio)), 4);
    this.expFill.fill({ color: 0x4488ff });

    this.expText.text = `${h.exp}/${h.maxExp}`;
    this.expText.x = hpBarX + hpBarW / 2 - this.expText.width / 2;
    this.expText.y = expBarY + 2 - this.expText.height / 2;

    // Level
    this.levelText.text = `Lv.${h.lvl}`;
    this.levelText.x = hpBarX;
    this.levelText.y = expBarY + 6;

    // Name
    const heroClassStr = String(h.heroClass);
    this.nameText.text = heroClassStr.charAt(0) + heroClassStr.slice(1).toLowerCase();
    this.nameText.x = hpBarX + 32;
    this.nameText.y = expBarY + 6;

    // Depth
    this.depthText.text = `D:${Dungeon.depth}`;
    this.depthText.x = hpBarX + 56;
    this.depthText.y = expBarY + 6;

    // Buffs
    this.buffIndicator.x = portraitW + 4;
    this.buffIndicator.y = expBarY + 14;
    this.buffIndicator.refresh();

    // Portrait frame
    const portrait = this.heroPortrait;
    const iconTex = this.iconTexture;
    if (portrait && iconTex) {
      const idx = PORTRAIT_MAP[h.heroClass] ?? 0;
      portrait.texture = new Texture({
        source: iconTex.source,
        frame: new Rectangle(idx * 16, 0, 16, 16),
      });
    }
  }

  setHero(hero: Hero | null): void {
    this.hero = hero;
    this.buffIndicator.setHero(hero);
    this.refresh();
  }
}
