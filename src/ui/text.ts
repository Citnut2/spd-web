import { Text, TextStyle } from 'pixi.js';
import { Renderer } from '../core/engine/Renderer';

const FONT = 'PixelFont, monospace';

interface TextOptions {
  text: string;
  size: number;
  fill: string;
}

const TEXT_RES = Renderer.SCALE * Math.max(1, window.devicePixelRatio || 1);

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
  t.resolution = TEXT_RES;
  return t;
}

export async function waitForFont(): Promise<void> {
  await document.fonts.ready;
}
