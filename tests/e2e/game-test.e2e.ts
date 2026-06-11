import { test, expect } from '@playwright/test';
import { queryScene, elementsByType, findElement } from './helpers';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const RESULTS = 'test-results';

test.describe('SPD Web Port', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => { console.log('PAGE ERROR:', err.message); });
  });

  test('Title→HeroSelect→Game navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    const canvas = page.locator('canvas');

    await page.mouse.click(320, 272);
    await page.waitForTimeout(500);

    await page.mouse.click(320, 96);
    await page.waitForTimeout(300);

    await page.mouse.click(320, 496);
    await page.waitForTimeout(1500);

    const ss = await canvas.screenshot({ path: `${RESULTS}/01-game.png` });
    expect(ss.byteLength).toBeGreaterThan(10000);
  });

  test('Keyboard input changes game scene', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    const canvas = page.locator('canvas');

    await page.mouse.click(320, 272);
    await page.waitForTimeout(500);
    await page.mouse.click(320, 96);
    await page.waitForTimeout(300);
    await page.mouse.click(320, 496);
    await page.waitForTimeout(1500);

    const ss1 = await canvas.screenshot({ path: `${RESULTS}/02-game-initial.png` });
    expect(ss1.byteLength).toBeGreaterThan(10000);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    const ss2 = await canvas.screenshot({ path: `${RESULTS}/03-game-after-move.png` });
    expect(ss2.byteLength).not.toBe(ss1.byteLength);
  });

  test('No console/page errors during full flow', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(1500);

    const canvas = page.locator('canvas');

    await page.mouse.click(320, 272);
    await page.waitForTimeout(500);
    await page.mouse.click(320, 96);
    await page.waitForTimeout(300);
    await page.mouse.click(320, 496);
    await page.waitForTimeout(1000);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(250);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(250);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(250);

    await canvas.screenshot({ path: `${RESULTS}/04-no-errors.png` });

    expect(errors.length).toBe(0);
  });

  test('Scene graph JSON query on title screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    const scene = await queryScene(page);

    // Save full JSON dump
    mkdirSync(RESULTS, { recursive: true });
    writeFileSync(join(RESULTS, 'scene-title.json'), JSON.stringify(scene, null, 2));

    expect(scene.type).toBe('title');
    expect(Array.isArray(scene.elements)).toBe(true);
    expect(scene.elements.length).toBeGreaterThan(0);

    // Should contain Image or BitmapText elements
    const texts = elementsByType(scene.elements, 'BitmapText');
    const images = elementsByType(scene.elements, 'Image');
    expect(texts.length + images.length).toBeGreaterThan(0);
  });

  test('Scene graph JSON query on game screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    // Navigate to game
    await page.mouse.click(320, 272);
    await page.waitForTimeout(800);
    await page.mouse.click(320, 96);
    await page.waitForTimeout(500);
    await page.mouse.click(320, 496);

    // Poll until scene type is 'game'
    let scene;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      scene = await queryScene(page);
      if (scene.type === 'game') break;
    }

    mkdirSync(RESULTS, { recursive: true });
    writeFileSync(join(RESULTS, 'scene-game.json'), JSON.stringify(scene!, null, 2));
    expect(scene!.type).toBe('game');

    expect(scene!.elements.length).toBeGreaterThan(500);

    // Camera should exist in game mode
    expect(scene!.camera).not.toBeNull();
    expect(scene!.camera!.zoom).toBeGreaterThan(0);

    // Should have Image terrain tiles
    const images = elementsByType(scene!.elements, 'Image');
    expect(images.length).toBeGreaterThan(100);

    // Should have the hero sprite
    const hero = findElement(scene!.elements, el => el.id.includes('HeroSprite'));
    expect(hero).toBeDefined();
    if (hero) {
      expect(hero.width).toBeGreaterThan(0);
      expect(hero.height).toBeGreaterThan(0);
    }
  });

  test('Scene graph elements have position data on game screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    await page.mouse.click(320, 272);
    await page.waitForTimeout(500);
    await page.mouse.click(320, 96);
    await page.waitForTimeout(300);
    await page.mouse.click(320, 496);

    let scene;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      scene = await queryScene(page);
      if (scene.type === 'game') break;
    }

    mkdirSync(RESULTS, { recursive: true });
    writeFileSync(join(RESULTS, 'scene-game-positions.json'), JSON.stringify(scene!, null, 2));

    // All elements should have numeric position values
    for (const el of scene!.elements) {
      expect(typeof el.x).toBe('number');
      expect(typeof el.y).toBe('number');
      expect(typeof el.width).toBe('number');
      expect(typeof el.height).toBe('number');
      expect(typeof el.visible).toBe('boolean');
    }
  });
});
