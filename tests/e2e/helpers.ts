import type { Page } from '@playwright/test';

export type SceneElement = {
  id: string;
  type: 'Image' | 'BitmapText' | 'Group' | 'Visual';
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  visible: boolean;
  camera: string;
  tint?: { rm: number; gm: number; bm: number; am: number; ra: number; ga: number; ba: number; aa: number };
  texture?: string;
  frame?: { x: number; y: number; width: number; height: number };
  text?: string;
  font?: string;
  children?: number;
};

export type QueryResult = {
  type: string;
  camera: {
    x: number; y: number; zoom: number; width: number; height: number;
    scrollX: number; scrollY: number; screenWidth: number; screenHeight: number;
  } | null;
  cameras: Array<{
    name: string;
    x: number; y: number; zoom: number; width: number; height: number;
    scrollX: number; scrollY: number; screenWidth: number; screenHeight: number;
  }>;
  elements: SceneElement[];
};

/** Wait until the game is fully loaded and __spdQuery is available */
export async function waitForGame(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const fn = (window as any).__spdQuery;
    return typeof fn === 'function';
  }, { timeout: 15000 });
}

/** Call the browser-side scene query and return parsed JSON */
export async function queryScene(page: Page): Promise<QueryResult> {
  const result = await page.evaluate(() => {
    const fn = (window as any).__spdQuery;
    if (!fn) throw new Error('__spdQuery not available — game may not be loaded');
    return fn();
  });
  return result as QueryResult;
}

/** Filter elements by type */
export function elementsByType(elements: SceneElement[], type: string): SceneElement[] {
  return elements.filter(e => e.type === type);
}

/** Find elements whose id contains a substring */
export function elementsBySubstring(elements: SceneElement[], sub: string): SceneElement[] {
  return elements.filter(e => e.id.toLowerCase().includes(sub.toLowerCase()));
}

/** Find first element matching a predicate */
export function findElement(
  elements: SceneElement[],
  fn: (el: SceneElement) => boolean
): SceneElement | undefined {
  return elements.find(fn);
}
