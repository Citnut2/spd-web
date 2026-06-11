import { Container } from 'pixi.js';
import type { ViewportManager } from '../core/engine/ViewportManager';

export abstract class Scene {
  readonly container = (() => {
    const c = new Container();
    c.eventMode = 'static';
    return c;
  })();

  abstract create(): void | Promise<void>;
  update(): void { /* no-op */ }

  onResize(_viewport: ViewportManager): void {
    // Subclasses override to reflow UI on resize
  }

  destroy(): void {
    this.container.removeFromParent();
    this.container.removeChildren();
  }
}
