import { Potion } from './Potion';
import { ItemSpriteSheet } from '../../sprites/ItemSpriteSheet';

export class PotionOfExperience extends Potion {
  icon = ItemSpriteSheet.Icons.POTION_EXP;

  bones = true;

  effect(): void {
    // hero.earnExp(hero.maxExp()), FloatingText.EXPERIENCE
  }

  value(): number {
    return this.isKnown() ? 50 * this.itemQuantity : super.value();
  }

  energyVal(): number {
    return this.isKnown() ? 10 * this.itemQuantity : super.energyVal();
  }

  name(): string {
    return 'Potion of Experience';
  }
}
