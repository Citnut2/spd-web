import { Container, Graphics } from 'pixi.js';
import type { Item } from '../../core/items/Item';
import type { Hero } from '../../core/hero/Hero';
import { makeText } from '../text';

const WIDTH = 120;
const MARGIN = 4;
const GAP = 2;
const BTN_HEIGHT = 12;

export class WndUseItem extends Container {
  private item: Item;
  private hero: Hero;
  private owner: Container | null;

  constructor(item: Item, hero: Hero, owner?: Container) {
    super();
    this.item = item;
    this.hero = hero;
    this.owner = owner ?? null;

    this.eventMode = 'static';

    this.build();
  }

  private build(): void {
    const actions = this.item.actions(this.hero);
    const title = this.item.title();

    const titleText = makeText({ text: title, size: 7, fill: '#ffff00' });
    titleText.x = MARGIN;
    titleText.y = MARGIN;

    const infoText = makeText({ text: this.itemInfo(), size: 5, fill: '#aaaaaa' });
    infoText.x = MARGIN;
    infoText.y = titleText.y + titleText.height + GAP;

    const bg = new Graphics();
    const contentH = infoText.y + infoText.height + GAP;
    const actionsH = actions.length > 0 ? actions.length * (BTN_HEIGHT + 1) + GAP : 0;
    const totalH = contentH + actionsH + MARGIN;

    bg.roundRect(0, 0, WIDTH, totalH, 2);
    bg.fill({ color: 0x000000, alpha: 0.9 });
    bg.stroke({ color: 0x888888, width: 1 });
    this.addChild(bg);

    this.addChild(titleText);
    this.addChild(infoText);

    const firstAction = actions.length > 0 ? actions[0] : null;

    let yOff = contentH;
    for (const action of actions) {
      const btn = this.makeButton(action, yOff, action === firstAction);
      this.addChild(btn);
      yOff += BTN_HEIGHT + 1;
    }
  }

  private itemInfo(): string {
    let info = '';
    const lvl = this.item.level();
    if (this.item.levelKnown && lvl !== 0) {
      info += lvl > 0 ? `+${lvl} ` : `${lvl} `;
    }
    info += this.item.name();
    if (this.item.cursed && this.item.cursedKnown) {
      info += ' (cursed)';
    }
    const qty = this.item.quantity();
    if (qty > 1) {
      info += ` x${qty}`;
    }
    return info || 'Unknown item';
  }

  private makeButton(action: string, y: number, isDefault: boolean): Container {
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.y = y;

    const label = this.actionLabel(action);

    const bg = new Graphics();
    bg.rect(1, 0, WIDTH - 2, BTN_HEIGHT);
    bg.fill({ color: isDefault ? 0x444444 : 0x333333 });
    c.addChild(bg);

    const t = makeText({ text: label, size: 6, fill: isDefault ? '#ffff00' : '#ffffff' });
    t.x = 4;
    t.y = BTN_HEIGHT / 2 - t.height / 2;
    c.addChild(t);

    c.on('pointerdown', () => {
      bg.tint = 0x666666;
    });

    c.on('pointerup', () => {
      bg.tint = 0xffffff;
      this.executeAction(action);
    });

    c.on('pointerupoutside', () => {
      bg.tint = 0xffffff;
    });

    return c;
  }

  private actionLabel(action: string): string {
    switch (action) {
      case 'EQUIP': return 'Equip';
      case 'UNEQUIP': return 'Unequip';
      case 'DRINK': return 'Drink';
      case 'READ': return 'Read';
      case 'ZAP': return 'Zap';
      case 'DROP': return 'Drop';
      case 'THROW': return 'Throw';
      default: return action.charAt(0) + action.slice(1).toLowerCase();
    }
  }

  private executeAction(action: string): void {
    const hero = this.hero;
    if (!hero.isAlive()) return;

    this.item.execute(hero, action);

    if (this.owner) {
      this.owner.removeFromParent();
    }
    this.removeFromParent();
  }
}
