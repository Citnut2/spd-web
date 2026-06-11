import { Container, Assets, Sprite, Texture, Rectangle } from 'pixi.js';
import { makeText } from './text';
import { Hero } from '../core/hero/Hero';
import { Dungeon } from '../core/levels/Dungeon';
import { BuffIndicator } from './BuffIndicator';

const PAD = 2;
export const STATUS_PANEL_WIDTH = 82;
export const STATUS_PANEL_HEIGHT = 38;

const PORTRAIT_MAP: Record<string, number> = {
  WARRIOR: 0, MAGE: 1, ROGUE: 2,
  HUNTRESS: 3, DUELIST: 4, CLERIC: 5,
};

export class StatusPane extends Container {
  private hero: Hero | null;

  private hpBar: Sprite;
  private shieldBar: Sprite;
  private expBar: Sprite;
  private hpText: ReturnType<typeof makeText>;
  private expText: ReturnType<typeof makeText>;
  private levelText: ReturnType<typeof makeText>;
  private depthText: ReturnType<typeof makeText>;
  private buffIndicator: BuffIndicator;
  private heroPortrait: Sprite | null = null;
  private iconTexture: Texture | null = null;

  constructor(hero: Hero | null) {
    super();
    this.hero = hero;
    this.eventMode = 'none';

    const statusTex = Assets.get('assets/interfaces/status_pane.png') as Texture | undefined;
    if (statusTex) {
      const bg = new Sprite(new Texture({ source: statusTex.source, frame: new Rectangle(0, 0, 82, 38) }));
      this.addChild(bg);
    }

    this.shieldBar = new Sprite();
    this.shieldBar.visible = false;
    this.addChild(this.shieldBar);

    this.hpBar = new Sprite();
    this.addChild(this.hpBar);

    this.expBar = new Sprite();
    this.addChild(this.expBar);

    this.hpText = makeText({ text: '', size: 4, fill: '#ffffff' });
    this.expText = makeText({ text: '', size: 4, fill: '#ffffaa' });
    this.levelText = makeText({ text: '', size: 5, fill: '#ffffaa' });
    this.depthText = makeText({ text: '', size: 4, fill: '#CACFC2' });

    this.addChild(this.hpText, this.expText, this.levelText, this.depthText);

    this.buffIndicator = new BuffIndicator(hero);
    this.addChild(this.buffIndicator);

    this.loadPortrait();
    this.refresh();
  }

  private async loadPortrait(): Promise<void> {
    try {
      const tex = await Assets.load('assets/interfaces/hero_icons.png');
      this.iconTexture = tex;
      this.updatePortrait();
    } catch {
      // fallback handled in refresh
    }
  }

  private updatePortrait(): void {
    if (!this.iconTexture || !this.hero) return;
    const idx = PORTRAIT_MAP[this.hero.heroClass] ?? 0;
    if (this.heroPortrait) {
      this.heroPortrait.texture = new Texture({
        source: this.iconTexture.source,
        frame: new Rectangle(idx * 16, 0, 16, 16),
      });
    } else {
      this.heroPortrait = new Sprite(
        new Texture({
          source: this.iconTexture.source,
          frame: new Rectangle(idx * 16, 0, 16, 16),
        }),
      );
      this.heroPortrait.x = 2;
      this.heroPortrait.y = 2;
      this.addChildAt(this.heroPortrait, 1);
    }
  }

  refresh(): void {
    const h = this.hero;
    if (!h) return;

    const portraitW = 18;
    const barX = portraitW + 2;
    const barW = STATUS_PANEL_WIDTH - barX - PAD;
    const max = h.HT || 1;

    const health = h.HP;
    const shield = (h as any).shielding ? (h as any).shielding() : 0;
    const healthPct = Math.min(1, health / max);
    const shieldPct = Math.min(1, shield / max);

    const statusTex = Assets.get('assets/interfaces/status_pane.png') as Texture | undefined;
    if (statusTex) {
      this.hpBar.texture = new Texture({ source: statusTex.source, frame: new Rectangle(0, 40, 50, 4) });
      this.hpBar.x = barX;
      this.hpBar.y = 2;
      this.hpBar.scale.x = (barW / 50) * healthPct;
      this.hpBar.scale.y = 1;

      if (shield > 0) {
        this.shieldBar.texture = new Texture({ source: statusTex.source, frame: new Rectangle(0, 44, 50, 4) });
        this.shieldBar.x = barX;
        this.shieldBar.y = 2;
        this.shieldBar.scale.x = (barW / 50) * (healthPct + shieldPct);
        this.shieldBar.scale.y = 1;
        this.shieldBar.visible = true;
      } else {
        this.shieldBar.visible = false;
      }

      this.expBar.texture = new Texture({ source: statusTex.source, frame: new Rectangle(0, 48, 17, 4) });
      this.expBar.x = barX;
      this.expBar.y = 2 + 4 + 2 + 16;
    }

    this.hpText.text = shield > 0 ? `${health}+${shield}/${h.HT}` : `${health}/${h.HT}`;
    this.hpText.x = barX + 1;
    this.hpText.y = 2;

    const expRatio = h.maxExp > 0 ? h.exp / h.maxExp : 0;
    this.expBar.scale.x = expRatio;
    this.expText.text = `${h.exp}/${h.maxExp}`;
    this.expText.x = barX + 1;
    this.expText.y = 2 + 4 + 2 + 16;

    this.levelText.text = `Lv ${h.lvl}`;
    this.levelText.x = barX + STATUS_PANEL_WIDTH - barX - PAD - 30;
    this.levelText.y = 2 + 4 + 2 + 16 + 2;

    this.depthText.text = `D:${Dungeon.depth}`;
    this.depthText.x = barX + STATUS_PANEL_WIDTH - barX - PAD - 30;
    this.depthText.y = 2 + 4 + 2 + 16 + 2 + 8;

    this.buffIndicator.x = barX;
    this.buffIndicator.y = 2 + 4 + 2;
    this.buffIndicator.refresh();

    this.updatePortrait();
  }

  setHero(hero: Hero | null): void {
    this.hero = hero;
    this.buffIndicator.setHero(hero);
    this.refresh();
  }
}
