import { Container } from 'pixi.js';
import { Scene } from './Scene';
import { TitleScene } from './scenes/TitleScene';
import { HeroSelectScene } from './scenes/HeroSelectScene';
import { GameScene } from './scenes/GameScene';
import { Camera } from '../core/engine/Camera';

const SCENE_REGISTRY: Record<string, new () => Scene> = {
  title: TitleScene,
  heroSelect: HeroSelectScene,
  game: GameScene,
};

export class SceneManager {
  readonly root: Container;
  private current: Scene | null = null;
  private currentKey: string | null = null;
  private camera: Camera;

  constructor(root: Container, camera: Camera) {
    this.root = root;
    this.camera = camera;
  }

  async switchTo(key: string): Promise<void> {
    if (key === this.currentKey) return;

    // Destroy current scene
    if (this.current) {
      this.current.destroy();
      this.root.removeChildren();
    }

    // Create new scene
    const SceneClass = SCENE_REGISTRY[key];
    if (!SceneClass) {
      console.error(`Unknown scene: ${key}`);
      return;
    }

    this.current = new SceneClass();
    this.currentKey = key;

    // Inject dependencies
    if (this.current instanceof GameScene) {
      this.current.setCamera(this.camera);
    }

    this.root.addChild(this.current.container);
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
