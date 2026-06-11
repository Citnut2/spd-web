import { Text, TextStyle } from 'pixi.js';
import { ViewportManager } from '../core/engine/ViewportManager';

const FONT = 'PixelFont, monospace';

interface TextOptions {
  text: string;
  size: number;
  fill: string;
}

function getTextRes(): number {
  const vm = ViewportManager.instance;
  if (vm) return vm.textResolution;
  return 4 * Math.max(1, window.devicePixelRatio || 1);
}

export function makeText(options: TextOptions): Text {
  const t = new Text({
    text: options.text,
    style: new TextStyle({
      fontFamily: FONT,
      fontSize: options.size,
      fill: options.fill,
    }),
  });
  (t as unknown as Record<string, unknown>)._autoResolution = false;
  t.resolution = getTextRes();
  return t;
}

export function refreshTextResolution(): void {
  const res = getTextRes();
  // Walk all Text objects and update resolution — not needed unless text is reused
  // After this call, newly created Text objects will use the new resolution
}

export async function waitForFont(): Promise<void> {
  await document.fonts.ready;
}
