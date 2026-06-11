import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfLiquidFlame extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_LIQFLAME;

  effect(): void {
    // shatter at hero pos: Fire blob around cell
  }

  name(): string {
    return 'Potion of Liquid Flame';
  }
}
