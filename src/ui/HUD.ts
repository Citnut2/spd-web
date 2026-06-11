import { Container } from 'pixi.js';
import { StatusPane } from './StatusPane';
import { GameLog } from './GameLog';
import { Toolbar } from './Toolbar';
import { GLog } from './GLog';
import { Hero } from '../core/hero/Hero';
import { Renderer } from '../core/engine/Renderer';

export class HUD {
  readonly container: Container;
  readonly statusPane: StatusPane;
  readonly gameLog: GameLog;
  readonly toolbar: Toolbar;

  private hero: Hero | null;

  constructor(hero: Hero | null) {
    this.container = new Container();
    this.container.eventMode = 'none';
    this.container.name = 'hud';

    this.hero = hero;

    this.statusPane = new StatusPane(hero);
    this.gameLog = new GameLog();
    this.toolbar = new Toolbar();

    this.container.addChild(this.statusPane, this.gameLog, this.toolbar);

    this.positionElements();

    GLog.add('Welcome to the dungeon...');
    GLog.add('@@Use arrows or WASD to move');
  }

  private positionElements(): void {
    const VH = Renderer.VIRTUAL_HEIGHT;

    // StatusPane at top
    this.statusPane.x = 2;
    this.statusPane.y = 1;

    // Toolbar at bottom
    this.toolbar.x = 2;
    this.toolbar.y = VH - Toolbar.HEIGHT - 2;

    // GameLog above toolbar
    this.gameLog.x = 2;
    this.gameLog.y = this.toolbar.y - 4;
  }

  setHero(hero: Hero | null): void {
    this.hero = hero;
    this.refresh();
  }

  refresh(): void {
    if (this.hero) {
      this.statusPane.refresh();
    }
  }

  update(): void {
    this.gameLog.update();
  }

  setEnabled(enabled: boolean): void {
    this.container.eventMode = enabled ? 'static' : 'none';
    this.toolbar.setEnabled(enabled);
  }
}
