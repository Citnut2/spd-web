// Base scene class — port of com.watabou.noosa.Scene

import { Container } from 'pixi.js';

export abstract class Scene {
  readonly container = (() => {
    const c = new Container();
    c.eventMode = 'static';
    return c;
  })();

  abstract create(): void | Promise<void>;
  update(): void { /* no-op */ }
  destroy(): void {
    this.container.removeFromParent();
    this.container.removeChildren();
  }
}
