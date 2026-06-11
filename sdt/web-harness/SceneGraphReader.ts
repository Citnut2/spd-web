// Scene Graph Reader — walks PixiJS scene tree and returns structured JSON
// matching the SDT protocol's scene graph format (SceneElement[]).
// Designed to run in-browser, callable via page.evaluate() in Playwright.

import type { SPDGame } from '../../src/core/engine/SPDGame';

// Replicate local types to avoid cross-package dependency
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
  tint?: {
    rm: number; gm: number; bm: number; am: number;
    ra: number; ga: number; ba: number; aa: number;
  };
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

/** Walk the PixiJS scene graph from the stage root and collect all elements */
export function buildSceneQuery(game: SPDGame): QueryResult {
  const { renderer } = game;
  const mainCam = game.camera;
  const app = renderer.app;
  const screenDpr = window.devicePixelRatio || 1;

  const elements: SceneElement[] = [];
  const seen = new Set<unknown>();

  const sceneKey = game.sceneManager?.getCurrentKey();
  const sceneType = sceneKey ?? 'unknown';

  function walk(obj: unknown): void {
    if (!obj || seen.has(obj)) return;
    seen.add(obj);

    const objAny = obj as Record<string, unknown>;
    const uid = (objAny.uid as string) ?? Math.random().toString(36).slice(2, 8);
    const id = `${objAny.constructor?.['name'] ?? 'Unknown'}@${uid}`;

    const children = objAny.children as unknown[] | undefined;

    const base: SceneElement = {
      id,
      type: 'Group',
      x: (objAny.x as number) ?? 0,
      y: (objAny.y as number) ?? 0,
      width: (objAny.width as number) ?? 0,
      height: (objAny.height as number) ?? 0,
      scaleX: ((objAny.scale as Record<string, number>)?.['_x'] ?? (objAny.scale as Record<string, number>)?.['x'] ?? 1) as number,
      scaleY: ((objAny.scale as Record<string, number>)?.['_y'] ?? (objAny.scale as Record<string, number>)?.['y'] ?? 1) as number,
      angle: (objAny.angle as number) ?? 0,
      visible: (objAny.visible as boolean) ?? true,
      camera: 'main',
    };

    const alpha = objAny.alpha as number | undefined;
    if (alpha !== undefined && alpha !== 1) {
      base.tint = {
        rm: 1, gm: 1, bm: 1, am: alpha,
        ra: 0, ga: 0, ba: 0, aa: 0,
      };
    }

    const typeName = objAny.constructor?.['name'] as string | undefined;

    if (typeName === 'Text' || typeName === 'BitmapText') {
      base.type = 'BitmapText';
      base.text = (objAny.text as string) ?? '';
      const style = objAny.style as Record<string, unknown> | undefined;
      base.font = (style?.fontFamily as string) ?? 'unknown';
      base.width = (objAny.width as number) ?? 0;
      base.height = (objAny.height as number) ?? 0;
    } else if (typeName === 'Sprite' || typeName === 'AnimatedSprite') {
      base.type = 'Image';
      const texture = objAny.texture as Record<string, unknown> | undefined;
      if (texture) {
        const src = texture.source as Record<string, unknown> | undefined;
        base.texture = (src?.label as string) || (src?.url as string) || 'sprite';
        const frame = texture.frame as Record<string, number> | undefined;
        if (frame) {
          base.frame = {
            x: frame.x as number,
            y: frame.y as number,
            width: frame.width as number,
            height: frame.height as number,
          };
        }
      }
      base.width = (objAny.width as number) ?? 0;
      base.height = (objAny.height as number) ?? 0;
    } else if (typeName === 'TilingSprite') {
      base.type = 'Image';
      const texture = objAny.texture as Record<string, unknown> | undefined;
      if (texture) {
        const src = texture.source as Record<string, unknown> | undefined;
        base.texture = (src?.label as string) || 'tiling';
      }
      base.width = (objAny.width as number) ?? 0;
      base.height = (objAny.height as number) ?? 0;
    }

    if (children && children.length > 0) {
      base.children = children.length;
    }

    elements.push(base);

    if (children) {
      for (const child of children) {
        walk(child);
      }
    }
  }

  walk(app.stage);

  const camInfo = mainCam
    ? {
        x: mainCam.x,
        y: mainCam.y,
        zoom: renderer.zoom,
        width: renderer.width,
        height: renderer.height,
        scrollX: -mainCam.container.x,
        scrollY: -mainCam.container.y,
        screenWidth: app.renderer.width / screenDpr,
        screenHeight: app.renderer.height / screenDpr,
      }
    : null;

  return {
    type: sceneType,
    camera: camInfo,
    cameras: camInfo ? [{ name: 'main', ...camInfo }] : [],
    elements,
  };
}
