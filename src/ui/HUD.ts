import { Container } from 'pixi.js';
import { StatusPane } from './StatusPane';
import { GameLog } from './GameLog';
import { Toolbar } from './Toolbar';
import { BuffIndicator } from './BuffIndicator';
import { GLog } from './GLog';
import { Hero } from '../core/hero/Hero';
import { ViewportManager } from '../core/engine/ViewportManager';

export class HUD {
  readonly container: Container;
  readonly statusPane: StatusPane;
  readonly gameLog: GameLog;
  readonly toolbar: Toolbar;
  readonly buffIndicator: BuffIndicator;

  private hero: Hero | null;

  constructor(hero: Hero | null) {
    this.container = new Container();
    this.container.eventMode = 'none';
    this.container.label = 'hud';

    this.hero = hero;

    this.statusPane = new StatusPane(hero);
    this.gameLog = new GameLog();
    this.toolbar = new Toolbar();
    this.buffIndicator = new BuffIndicator(hero);

    this.container.addChild(this.statusPane, this.gameLog, this.toolbar, this.buffIndicator);

    this.positionElements();
    this.toolbar.refreshSlots(hero);

    GLog.add('Welcome to the dungeon...');
    GLog.add('@@Use arrows or WASD to move');
  }

  private positionElements(): void {
    const VH = ViewportManager.BASE_HEIGHT;

    // StatusPane at top
    this.statusPane.x = 2;
    this.statusPane.y = 1;

    // BuffIndicator below status pane
    this.buffIndicator.x = 2;
    this.buffIndicator.y = this.statusPane.y + this.statusPane.contentHeight + 1;

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
      this.buffIndicator.refresh();
      this.toolbar.refreshSlots(this.hero);
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
