import { Container } from 'pixi.js';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { Game } from './Game';
import type { SceneManager } from '../../ui/SceneManager';

export class SPDGame extends Game {
  readonly renderer: Renderer;
  readonly camera: Camera;
  readonly hudLayer: Container;
  sceneManager: SceneManager | null = null;

  private rafId: number | null = null;
  private lastTime = 0;

  constructor() {
    super();
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.hudLayer = new Container();
    this.hudLayer.eventMode = 'none';
    this.hudLayer.label = 'hud-layer';
  }

  async init(container: HTMLElement): Promise<void> {
    await this.renderer.init(container);
    this.renderer.root.addChild(this.camera.container);
    this.renderer.root.addChild(this.hudLayer);
  }

  start(): void {
    this.lastTime = performance.now();
    this.loop(performance.now());
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (time: number): void => {
    const dt = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;

    this.elapsed = this.timeScale * dt;
    this.now += this.elapsed;

    this.processTurn();
    this.sceneManager?.update();

    this.rafId = requestAnimationFrame(this.loop);
  };
}
