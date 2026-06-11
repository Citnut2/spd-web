import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfFrost extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_FROST;

  effect(): void {
    // shatter at hero pos: Freezing blob around cell
  }

  name(): string {
    return 'Potion of Frost';
  }
}
