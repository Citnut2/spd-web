import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfToxicGas extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_TOXICGAS;

  effect(): void {
    // shatter at hero pos: ToxicGas blob
  }

  name(): string {
    return 'Potion of Toxic Gas';
  }
}
