import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfMindVision extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_MINDVIS;

  effect(): void {
    // Buff.prolong(hero, MindVision.class, MindVision.DURATION)
    // Dungeon.observe()
  }

  name(): string {
    return 'Potion of Mind Vision';
  }
}
