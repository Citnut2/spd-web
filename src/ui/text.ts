import { Text, TextStyle } from 'pixi.js';
import { ViewportManager } from '../core/engine/ViewportManager';

const FONT = 'PixelFont, monospace';

interface TextOptions {
  text: string;
  size: number;
  fill: string;
}

let _viewportRef: ViewportManager | null = null;

export function setTextResolutionSource(vm: ViewportManager): void {
  _viewportRef = vm;
}

function getTextRes(): number {
  if (_viewportRef) return _viewportRef.textResolution;
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
  // Text resolution will be picked up by new Text objects via getTextRes()
}

export async function waitForFont(): Promise<void> {
  await document.fonts.ready;
}
