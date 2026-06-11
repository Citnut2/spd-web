import { Container } from 'pixi.js';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { ViewportManager } from './ViewportManager';
import { Game } from './Game';
import type { SceneManager } from '../../ui/SceneManager';

export class SPDGame extends Game {
  readonly renderer: Renderer;
  readonly camera: Camera;
  readonly viewport: ViewportManager;

  readonly worldContainer: Container;
  readonly hudContainer: Container;
  readonly overlayContainer: Container;

  sceneManager: SceneManager | null = null;

  private rafId: number | null = null;
  private lastTime = 0;

  constructor() {
    super();
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.viewport = this.renderer.viewport;

    this.worldContainer = new Container();
    this.worldContainer.label = 'world-container';
    this.worldContainer.eventMode = 'static';

    this.hudContainer = new Container();
    this.hudContainer.label = 'hud-container';
    this.hudContainer.eventMode = 'static';

    this.overlayContainer = new Container();
    this.overlayContainer.label = 'overlay-container';
    this.overlayContainer.eventMode = 'none';
  }

  async init(container: HTMLElement): Promise<void> {
    await this.renderer.init(container);

    const root = this.renderer.root;

    this.camera.container.addChild(this.worldContainer);
    root.addChild(this.camera.container);
    root.addChild(this.hudContainer);
    root.addChild(this.overlayContainer);
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
