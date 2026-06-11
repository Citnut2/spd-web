import { Application, Container } from 'pixi.js';

export class Renderer {
  readonly app: Application;
  readonly root: Container;

  static readonly VIRTUAL_WIDTH = 160;
  static readonly VIRTUAL_HEIGHT = 144;
  static readonly TILE_SIZE = 16;
  static readonly SCALE = 4;

  private scale = Renderer.SCALE;

  constructor() {
    this.app = new Application();
    this.root = new Container();
  }

  async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      width: Renderer.VIRTUAL_WIDTH * this.scale,
      height: Renderer.VIRTUAL_HEIGHT * this.scale,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      antialias: false,
      autoDensity: true,
      roundPixels: true,
      preserveDrawingBuffer: true,
    });

    container.appendChild(this.app.canvas as HTMLCanvasElement);
    this.app.stage.addChild(this.root);

    this.root.scale.set(this.scale);
    this.root.eventMode = 'static';

    this.app.canvas.style.imageRendering = 'pixelated';
  }

  get width(): number {
    return Renderer.VIRTUAL_WIDTH;
  }

  get height(): number {
    return Renderer.VIRTUAL_HEIGHT;
  }

  get zoom(): number {
    return this.scale;
  }

  setZoom(z: number): void {
    this.scale = Math.max(2, Math.min(8, Math.round(z)));
    this.app.renderer.resize(
      Renderer.VIRTUAL_WIDTH * this.scale,
      Renderer.VIRTUAL_HEIGHT * this.scale
    );
  }

  screenToVirtual(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: Math.floor(screenX / this.scale),
      y: Math.floor(screenY / this.scale)
    };
  }

  destroy(): void {
    this.app.destroy(true);
  }
}
