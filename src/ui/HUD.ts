import { Container } from 'pixi.js';
import { StatusPane, STATUS_PANEL_HEIGHT } from './StatusPane';
import { GameLog } from './GameLog';
import { Toolbar, TOOLBAR_WIDTH } from './Toolbar';
import { InventoryPanel, INVENTORY_PANEL_WIDTH, INVENTORY_PANEL_HEIGHT } from './InventoryPanel';
import { GLog } from './GLog';
import type { Hero } from '../core/hero/Hero';
import type { ViewportManager } from '../core/engine/ViewportManager';

const HUD_MARGIN = 2;

export class HUD {
  readonly container: Container;
  readonly statusPane: StatusPane;
  readonly gameLog: GameLog;
  readonly toolbar: Toolbar;
  readonly inventoryPanel: InventoryPanel;

  private hero: Hero | null;

  constructor(hero: Hero | null) {
    this.container = new Container();
    this.container.eventMode = 'static';
    this.container.label = 'hud';

    this.hero = hero;

    this.statusPane = new StatusPane(hero);
    this.gameLog = new GameLog();
    this.toolbar = new Toolbar();
    this.inventoryPanel = new InventoryPanel(hero);

    this.container.addChild(this.statusPane);
    this.container.addChild(this.gameLog);
    this.container.addChild(this.toolbar);
    this.container.addChild(this.inventoryPanel);

    GLog.add('Welcome to the dungeon...');
    GLog.add('@@Use arrows or WASD to move');
  }

  positionElements(vm: ViewportManager): void {
    const vw = vm.viewportWidth;
    const vh = vm.viewportHeight;

    // Hero panel: bottom-left
    this.statusPane.x = HUD_MARGIN;
    this.statusPane.y = vh - STATUS_PANEL_HEIGHT - HUD_MARGIN;

    // Message log: above hero panel
    this.gameLog.x = HUD_MARGIN;
    this.gameLog.y = this.statusPane.y - 2;

    // Inventory panel: bottom-right
    this.inventoryPanel.x = vw - INVENTORY_PANEL_WIDTH - HUD_MARGIN;
    this.inventoryPanel.y = vh - INVENTORY_PANEL_HEIGHT - HUD_MARGIN;

    // Toolbar: top-right
    this.toolbar.x = vw - TOOLBAR_WIDTH - HUD_MARGIN;
    this.toolbar.y = HUD_MARGIN;
  }

  setHero(hero: Hero | null, vm?: ViewportManager): void {
    this.hero = hero;
    this.statusPane.setHero(hero);
    this.inventoryPanel.refresh();
    if (vm) this.positionElements(vm);
  }

  refresh(): void {
    if (this.hero) {
      this.statusPane.refresh();
      this.inventoryPanel.refresh();
    }
  }

  update(): void {
    this.gameLog.update();
  }

  setEnabled(_enabled: boolean): void {
    this.container.eventMode = _enabled ? 'static' : 'none';
  }
}
