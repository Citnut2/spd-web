import { Container, Texture, Assets, Sprite, Rectangle } from 'pixi.js';
import { ItemSpriteSheet } from '../core/sprites/ItemSpriteSheet';
import type { Item } from '../core/items/Item';
import { makeText } from './text';

const ITEMS_TEX = 'assets/sprites/items.png';

export class ItemSlot extends Container {
  item: Item | null = null;
  private sprite: Sprite;
  private quantityText: ReturnType<typeof makeText> | null = null;
  constructor() {
    super();
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.addChild(this.sprite);
    this.sprite.visible = false;
  }

  setItem(item: Item | null): void {
    this.item = item;
    if (!item) {
      this.sprite.visible = false;
      if (this.quantityText) this.quantityText.visible = false;
      return;
    }
    this.sprite.visible = true;
    const tex = Assets.get(ITEMS_TEX) as Texture | undefined;
    if (tex) {
      const rows = 256 / ItemSpriteSheet.SIZE;
      const row = Math.floor(item.image / rows);
      const col = item.image % rows;
      this.sprite.texture = new Texture({
        source: tex.source,
        frame: new Rectangle(col * ItemSpriteSheet.SIZE, row * ItemSpriteSheet.SIZE, ItemSpriteSheet.SIZE, ItemSpriteSheet.SIZE),
      });
    }

    if (item.itemQuantity > 1) {
      if (!this.quantityText) {
        this.quantityText = makeText({ text: '', size: 4, fill: '#ffffff' });
        this.quantityText.x = 2;
        this.quantityText.y = -ItemSpriteSheet.SIZE / 2 - 1;
        this.addChild(this.quantityText);
      }
      this.quantityText.text = String(item.itemQuantity);
      this.quantityText.visible = true;
    } else if (this.quantityText) {
      this.quantityText.visible = false;
    }
  }
}
