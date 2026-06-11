import { Container, Graphics } from 'pixi.js';
import { ItemSlot } from './ItemSlot';
import type { Hero } from '../core/hero/Hero';
import type { Item } from '../core/items/Item';

const SLOT_ACTIVE_COLOR = 0x444444;
const SLOT_INACTIVE_COLOR = 0x222222;

export class QuickSlotButton extends Container {
  readonly slotNum: number;
  private slot: ItemSlot;
  private enabled = true;
  private onClick: ((item: Item, hero: Hero) => void) | null = null;
  private bg: Graphics;

  constructor(slotNum: number, onClick: (item: Item, hero: Hero) => void) {
    super();
    this.slotNum = slotNum;
    this.onClick = onClick;
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.bg = new Graphics();
    this.bg.rect(0, 0, 20, 20);
    this.bg.fill({ color: SLOT_INACTIVE_COLOR });
    this.addChild(this.bg);

    this.slot = new ItemSlot();
    this.slot.x = 10;
    this.slot.y = 10;
    this.addChild(this.slot);

    this.on('pointerdown', () => this.handleClick());
  }

  private handleClick(): void {
    if (!this.enabled || !this.slot.item) return;
    const hero = (window as any).__spdHero as Hero | undefined;
    if (!hero) return;
    this.onClick!(this.slot.item, hero);
  }

  setItem(item: Item | null): void {
    this.slot.setItem(item);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.4;
    this.bg.clear();
    this.bg.rect(0, 0, 20, 20);
    this.bg.fill({ color: enabled ? SLOT_ACTIVE_COLOR : SLOT_INACTIVE_COLOR });
  }

  static refresh(): void {
    // Called externally to update all quickslots
  }
}
