import { Container } from 'pixi.js';
import { StatusPane, STATUS_PANEL_WIDTH, STATUS_PANEL_HEIGHT } from './StatusPane';
import { GameLog } from './GameLog';
import { Toolbar, TOOLBAR_WIDTH, TOOLBAR_HEIGHT } from './Toolbar';
import { InventoryPanel, INVENTORY_PANEL_WIDTH, INVENTORY_PANEL_HEIGHT } from './InventoryPanel';
import { GLog } from './GLog';
import type { Hero } from '../core/hero/Hero';
import { AnchorLayout, ANCHOR } from './layout/AnchorLayout';
import type { ViewportManager } from '../core/engine/ViewportManager';

const LOG_PANEL_WIDTH = 120;
const LOG_PANEL_HEIGHT = 28;

export class HUD {
  readonly container: Container;
  readonly statusPane: StatusPane;
  readonly gameLog: GameLog;
  readonly toolbar: Toolbar;
  readonly inventoryPanel: InventoryPanel;

  private hero: Hero | null;
  private layoutEngine: AnchorLayout;

  constructor(hero: Hero | null) {
    this.container = new Container();
    this.container.eventMode = 'static';
    this.container.label = 'hud';

    this.hero = hero;

    this.statusPane = new StatusPane(hero);
    this.gameLog = new GameLog();
    this.toolbar = new Toolbar();
    this.inventoryPanel = new InventoryPanel(hero);

    this.container.addChild(this.statusPane, this.gameLog, this.toolbar, this.inventoryPanel);

    this.layoutEngine = new AnchorLayout();
    this.layoutEngine.addPanel({
      container: this.toolbar,
      anchor: ANCHOR.TOP_RIGHT,
      width: TOOLBAR_WIDTH,
      height: TOOLBAR_HEIGHT,
      marginTop: 1,
      marginRight: 1,
    });
    this.layoutEngine.addPanel({
      container: this.gameLog,
      anchor: ANCHOR.BOTTOM_LEFT,
      width: LOG_PANEL_WIDTH,
      height: LOG_PANEL_HEIGHT,
      marginBottom: 1,
    });
    this.layoutEngine.addPanel({
      container: this.statusPane,
      anchor: ANCHOR.BOTTOM_LEFT,
      width: STATUS_PANEL_WIDTH,
      height: STATUS_PANEL_HEIGHT,
      marginBottom: 1,
    });
    this.layoutEngine.addPanel({
      container: this.inventoryPanel,
      anchor: ANCHOR.BOTTOM_RIGHT,
      width: INVENTORY_PANEL_WIDTH,
      height: INVENTORY_PANEL_HEIGHT,
      marginBottom: 1,
      marginRight: 1,
    });

    GLog.add('Welcome to the dungeon...');
    GLog.add('@@Use arrows or WASD to move');
  }

  positionElements(viewport: ViewportManager): void {
    this.layoutEngine.layout(
      viewport.viewportWidth,
      viewport.viewportHeight,
      viewport.safeVirtualTop,
      viewport.safeVirtualBottom,
      viewport.safeVirtualLeft,
      viewport.safeVirtualRight,
    );
  }

  setHero(hero: Hero | null, viewport?: ViewportManager): void {
    this.hero = hero;
    if (viewport) this.positionElements(viewport);
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
