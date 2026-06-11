import { Container } from 'pixi.js';
import type { ViewportManager } from '../core/engine/ViewportManager';
import type { SPDGame } from '../core/engine/SPDGame';

export abstract class Scene {
  readonly container: Container;
  protected game: SPDGame | null = null;

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'static';
  }

  setGame(game: SPDGame): void {
    this.game = game;
  }

  abstract create(): void | Promise<void>;
  update(): void { /* no-op */ }

  onResize(_viewport: ViewportManager): void {
    // Subclasses override to reflow UI on resize
  }

  destroy(): void {
    this.container.removeChildren();
  }
}
