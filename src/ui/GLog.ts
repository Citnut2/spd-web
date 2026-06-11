import { Signal } from '../core/utils/Signal';

export const GLog = {
  update: new Signal<string>(),

  POSITIVE: '#00ff00',
  NEGATIVE: '#ff0000',
  WARNING: '#ffff00',
  HIGHLIGHT: '#ffffff',

  add(text: string): void {
    GLog.update.dispatch(text);
  },

  wipe(): void {
    GLog.update.dispatch('__WIPE__');
  },
};
