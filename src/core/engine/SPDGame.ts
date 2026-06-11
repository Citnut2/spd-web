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

  readonly worldLayer: Container;
  readonly effectLayer: Container;
  readonly uiLayer: Container;
  readonly debugLayer: Container;

  sceneManager: SceneManager | null = null;

  private rafId: number | null = null;
  private lastTime = 0;

  constructor() {
    super();
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.viewport = this.renderer.viewport;

    this.worldLayer = new Container();
    this.worldLayer.label = 'world-layer';
    this.worldLayer.eventMode = 'static';

    this.effectLayer = new Container();
    this.effectLayer.label = 'effect-layer';

    this.uiLayer = new Container();
    this.uiLayer.label = 'ui-layer';
    this.uiLayer.eventMode = 'none';

    this.debugLayer = new Container();
    this.debugLayer.label = 'debug-layer';
    this.debugLayer.eventMode = 'none';
  }

  async init(container: HTMLElement): Promise<void> {
    await this.renderer.init(container);

    const root = this.renderer.root;

    this.camera.container.addChild(this.worldLayer);
    this.camera.container.addChild(this.effectLayer);
    root.addChild(this.camera.container);
    root.addChild(this.uiLayer);
    root.addChild(this.debugLayer);
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
