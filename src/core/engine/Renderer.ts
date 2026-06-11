import { Application, Container, TextureSource } from 'pixi.js';
import { ViewportManager } from './ViewportManager';

export class Renderer {
  static instance: Renderer;

  readonly app: Application;
  readonly root: Container;
  readonly viewport: ViewportManager;

  private _initialized = false;

  constructor() {
    Renderer.instance = this;
    this.app = new Application();
    this.root = new Container();
    this.viewport = new ViewportManager();
  }

  async init(container: HTMLElement): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    await this.app.init({
      width: container.clientWidth || 640,
      height: container.clientHeight || 480,
      backgroundColor: 0x000000,
      resolution: dpr,
      antialias: false,
      autoDensity: true,
      roundPixels: true,
      preserveDrawingBuffer: true,
    });

    container.appendChild(this.app.canvas as HTMLCanvasElement);
    this.app.canvas.style.imageRendering = 'pixelated';
    this.app.stage.addChild(this.root);
    this.root.eventMode = 'static';

    // ViewportManager monitors container size and handles resize
    this.viewport.observe(container);
  }

  destroy(): void {
    this.viewport.observe(null);
    this.app.destroy(true);
  }
}
