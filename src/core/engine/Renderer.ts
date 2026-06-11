import { Application, Container } from 'pixi.js';
import { ViewportManager } from './ViewportManager';

export class Renderer {
  readonly app: Application;
  readonly root: Container;
  readonly viewport: ViewportManager;

  private _initialized = false;

  constructor() {
    this.app = new Application();
    this.root = new Container();
    this.viewport = new ViewportManager();
    this.viewport.setRenderer(this);
  }

  async init(container: HTMLElement): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    const w = container.clientWidth || 640;
    const h = container.clientHeight || 480;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    await this.app.init({
      width: Math.round(w * dpr),
      height: Math.round(h * dpr),
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

    this.viewport.observe(container);
  }

  destroy(): void {
    this.viewport.observe(null);
    this.app.destroy(true);
  }
}
