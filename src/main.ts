import './style.css';
import { TextureSource } from 'pixi.js';
import { SPDGame } from './core/engine/SPDGame';
import { SceneManager } from './ui/SceneManager';
import { Dungeon } from './core/levels/Dungeon';
import { waitForFont } from './ui/text';
import { buildSceneQuery } from '../sdt/web-harness/SceneGraphReader';

// All textures use nearest-neighbor filtering for crisp pixel art
TextureSource.defaultOptions.scaleMode = 'nearest';

async function main() {
  console.log('Shattered Pixel Dungeon — Web Edition');
  console.log('Initializing...');

  const game = new SPDGame();
  const container = document.getElementById('game-container') ?? document.body;

  await game.init(container);

  // Wait for PixelFont to load before showing any text
  await waitForFont();

  const sceneManager = new SceneManager(game.camera.container, game.camera);
  game.sceneManager = sceneManager;

  // Scene switching via custom events
  window.addEventListener('spd:scene', ((e: CustomEvent) => {
    const { scene, heroClass } = e.detail;
    if (scene === 'game' && heroClass) {
      Dungeon.initHero(heroClass);
      Dungeon.newLevel();
    }
    sceneManager.switchTo(scene);
  }) as EventListener);

  // Start with title scene
  await sceneManager.switchTo('title');
  game.start();

  // Expose game instance + scene query for Playwright / devtools
  (window as unknown as Record<string, unknown>).__spdGame = game;
  (window as unknown as Record<string, unknown>).__spdQuery = () => buildSceneQuery(game);

  console.log('Game started!');
}

main().catch(console.error);
