import { Container } from 'pixi.js';
import { Scene } from './Scene';
import { TitleScene } from './scenes/TitleScene';
import { HeroSelectScene } from './scenes/HeroSelectScene';
import { GameScene } from './scenes/GameScene';
import { SPDGame } from '../core/engine/SPDGame';

const SCENE_REGISTRY: Record<string, new () => Scene> = {
  title: TitleScene,
  heroSelect: HeroSelectScene,
  game: GameScene,
};

export class SceneManager {
  readonly worldLayer: Container;
  readonly uiLayer: Container;
  private current: Scene | null = null;
  private currentKey: string | null = null;

  constructor(game: SPDGame) {
    this.worldLayer = game.worldLayer;
    this.uiLayer = game.uiLayer;
  }

  async switchTo(key: string): Promise<void> {
    if (key === this.currentKey) return;

    // Destroy current scene
    if (this.current) {
      this.current.destroy();
      this.worldLayer.removeChildren();
    }

    // Create new scene
    const SceneClass = SCENE_REGISTRY[key];
    if (!SceneClass) {
      console.error(`Unknown scene: ${key}`);
      return;
    }

    this.current = new SceneClass();
    this.currentKey = key;

    this.worldLayer.addChild(this.current.container);
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
}
