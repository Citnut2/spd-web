import { Renderer } from './Renderer';

export type ResizeCallback = (viewport: ViewportManager) => void;

export class ViewportManager {
  static readonly BASE_WIDTH = 160;
  static readonly BASE_HEIGHT = 144;
  static readonly TILE_SIZE = 16;

  scale = 4;
  offsetX = 0;
  offsetY = 0;
  dpr = 1;
  canvasWidth = 0;
  canvasHeight = 0;

  safeTop = 0;
  safeBottom = 0;
  safeLeft = 0;
  safeRight = 0;

  private _portrait = false;
  private _fullscreen = false;
  private resizeObserver: ResizeObserver | null = null;
  private resizeCallbacks: Array<ResizeCallback> = [];
  private renderer: Renderer | null = null;

  constructor() {
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    document.addEventListener('fullscreenchange', () => {
      this._fullscreen = !!document.fullscreenElement;
    });
  }

  get portrait(): boolean { return this._portrait; }
  get fullscreen(): boolean { return this._fullscreen; }
  get viewportWidth(): number { return ViewportManager.BASE_WIDTH; }
  get viewportHeight(): number { return ViewportManager.BASE_HEIGHT; }

  get safeVirtualTop(): number { return Math.ceil(this.safeTop / this.scale); }
  get safeVirtualBottom(): number { return Math.ceil(this.safeBottom / this.scale); }
  get safeVirtualLeft(): number { return Math.ceil(this.safeLeft / this.scale); }
  get safeVirtualRight(): number { return Math.ceil(this.safeRight / this.scale); }

  get textResolution(): number {
    return this.scale * this.dpr;
  }

  setRenderer(renderer: Renderer): void {
    this.renderer = renderer;
  }

  observe(container: HTMLElement | null): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (!container) return;

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.handleResize(width, height);
      }
    });
    this.resizeObserver.observe(container);

    this.handleResize(container.clientWidth, container.clientHeight);
  }

  handleResize(width: number, height: number): void {
    this.canvasWidth = Math.max(1, Math.round(width));
    this.canvasHeight = Math.max(1, Math.round(height));
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this._portrait = height > width;
    this.readSafeArea();
    this.calculateScale();

    const renderer = this.renderer;
    if (renderer) {
      renderer.app.renderer.resize(this.canvasWidth, this.canvasHeight);
      renderer.root.x = this.offsetX;
      renderer.root.y = this.offsetY;
      renderer.root.scale.set(this.scale);
    }

    this.notifyResize();
  }

  private calculateScale(): void {
    const baseW = ViewportManager.BASE_WIDTH;
    const baseH = ViewportManager.BASE_HEIGHT;

    const scaleX = Math.floor(this.canvasWidth / baseW);
    const scaleY = Math.floor(this.canvasHeight / baseH);
    const intScale = Math.max(1, Math.min(scaleX, scaleY));

    if (intScale >= 1) {
      this.scale = intScale;
    } else {
      const fracX = this.canvasWidth / baseW;
      const fracY = this.canvasHeight / baseH;
      this.scale = Math.max(0.5, Math.min(fracX, fracY));
    }

    this.offsetX = Math.floor((this.canvasWidth - baseW * this.scale) / 2);
    this.offsetY = Math.floor((this.canvasHeight - baseH * this.scale) / 2);
  }

  private readSafeArea(): void {
    const style = getComputedStyle(document.documentElement);
    this.safeTop = this.parseEnv(style.getPropertyValue('--sat'), 0);
    this.safeBottom = this.parseEnv(style.getPropertyValue('--sab'), 0);
    this.safeLeft = this.parseEnv(style.getPropertyValue('--sal'), 0);
    this.safeRight = this.parseEnv(style.getPropertyValue('--sar'), 0);
  }

  private parseEnv(val: string, fallback: number): number {
    if (!val || val === '0px' || val === 'env(safe-area-inset-top)') return fallback;
    const num = parseInt(val, 10);
    return isNaN(num) ? fallback : num;
  }

  screenToVirtual(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale,
    };
  }

  virtualToScreen(virtualX: number, virtualY: number): { x: number; y: number } {
    return {
      x: virtualX * this.scale + this.offsetX,
      y: virtualY * this.scale + this.offsetY,
    };
  }

  screenToCell(
    screenX: number,
    screenY: number,
    cameraX: number,
    cameraY: number,
    mapWidth: number,
  ): number {
    const v = this.screenToVirtual(screenX, screenY);
    const worldX = v.x + cameraX;
    const worldY = v.y + cameraY;
    const tileX = Math.floor(worldX / ViewportManager.TILE_SIZE);
    const tileY = Math.floor(worldY / ViewportManager.TILE_SIZE);
    return tileY * mapWidth + tileX;
  }

  async requestFullscreen(): Promise<void> {
    try {
      await document.documentElement.requestFullscreen();
    } catch { /* not supported */ }
  }

  async exitFullscreen(): Promise<void> {
    try {
      await document.exitFullscreen();
    } catch { /* not supported */ }
  }

  async toggleFullscreen(): Promise<void> {
    if (this._fullscreen) await this.exitFullscreen();
    else await this.requestFullscreen();
  }

  onResize(cb: ResizeCallback): void {
    this.resizeCallbacks.push(cb);
  }

  removeResizeCallback(cb: ResizeCallback): void {
    const idx = this.resizeCallbacks.indexOf(cb);
    if (idx >= 0) this.resizeCallbacks.splice(idx, 1);
  }

  private notifyResize(): void {
    for (const cb of this.resizeCallbacks) {
      cb(this);
    }
  }
}
