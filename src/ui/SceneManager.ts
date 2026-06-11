import { Container } from 'pixi.js';
import { Scene } from './Scene';
import { TitleScene } from './scenes/TitleScene';
import { HeroSelectScene } from './scenes/HeroSelectScene';
import { GameScene } from './scenes/GameScene';
import { SPDGame } from '../core/engine/SPDGame';
import type { ViewportManager } from '../core/engine/ViewportManager';

const SCENE_REGISTRY: Record<string, new () => Scene> = {
  title: TitleScene,
  heroSelect: HeroSelectScene,
  game: GameScene,
};

export class SceneManager {
  readonly worldContainer: Container;
  readonly hudContainer: Container;
  readonly overlayContainer: Container;
  private current: Scene | null = null;
  private currentKey: string | null = null;
  private viewport: ViewportManager;
  private spdGame: SPDGame;

  constructor(game: SPDGame) {
    this.worldContainer = game.worldContainer;
    this.hudContainer = game.hudContainer;
    this.overlayContainer = game.overlayContainer;
    this.viewport = game.viewport;
    this.spdGame = game;
  }

  async switchTo(key: string): Promise<void> {
    if (key === this.currentKey) return;

    if (this.current) {
      this.current.destroy();
    }

    // Clear all layers
    this.worldContainer.removeChildren();
    this.hudContainer.removeChildren();
    this.overlayContainer.removeChildren();

    const SceneClass = SCENE_REGISTRY[key];
    if (!SceneClass) {
      console.error(`Unknown scene: ${key}`);
      return;
    }

    this.current = new SceneClass();
    this.currentKey = key;
    this.current.setGame(this.spdGame);

    // Add scene container to HUD layer so it's in the scene graph
    // Game worlds populate worldContainer directly
    this.hudContainer.addChild(this.current.container);

    await this.current.create();
  }

  getCurrent(): Scene | null {
    return this.current;
  }

  getCurrentKey(): string | null {
    return this.currentKey;
  }

  update(): void {
    this.current?.update();
  }

  handleResize(): void {
    if (this.current) {
      this.current.onResize(this.viewport);
    }
  }
}
