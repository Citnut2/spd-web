import { Container } from 'pixi.js';
import { StatusPane } from './StatusPane';
import { GameLog } from './GameLog';
import { Toolbar, TOOLBAR_WIDTH, TOOLBAR_HEIGHT } from './Toolbar';
import { InventoryPanel, INVENTORY_PANEL_HEIGHT } from './InventoryPanel';
import { MenuPane, MENU_PANE_WIDTH } from './MenuPane';
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
  readonly menuPane: MenuPane;
  readonly toolbarGroup: Container;

  private hero: Hero | null;

  constructor(hero: Hero | null, onOpenMenu: () => void) {
    this.container = new Container();
    this.container.eventMode = 'static';
    this.container.label = 'hud';
    this.hero = hero;

    this.menuPane = new MenuPane(onOpenMenu);
    this.statusPane = new StatusPane(hero);
    this.gameLog = new GameLog();
    this.toolbar = new Toolbar();
    this.inventoryPanel = new InventoryPanel(hero);

    this.toolbarGroup = this.createToolbarGroup();

    this.container.addChild(this.menuPane);
    this.container.addChild(this.statusPane);
    this.container.addChild(this.gameLog);
    this.container.addChild(this.toolbarGroup);

    GLog.add('Welcome to the dungeon...');
    GLog.add('@@Use arrows or WASD to move');
  }

  private createToolbarGroup(): Container {
    const grp = new Container();
    grp.label = 'toolbarGroup';

    this.toolbar.x = 0;
    this.toolbar.y = 0;
    grp.addChild(this.toolbar);

    this.inventoryPanel.x = 0;
    this.inventoryPanel.y = TOOLBAR_HEIGHT;
    grp.addChild(this.inventoryPanel);

    return grp;
  }

  positionElements(vm: ViewportManager): void {
    const vw = vm.viewportWidth;
    const vh = vm.viewportHeight;

    this.menuPane.x = vw - MENU_PANE_WIDTH - HUD_MARGIN;
    this.menuPane.y = HUD_MARGIN;
    this.menuPane.refresh();

    this.statusPane.x = HUD_MARGIN;
    this.statusPane.y = HUD_MARGIN;

    this.gameLog.x = HUD_MARGIN;
    this.gameLog.y = vh - TOOLBAR_HEIGHT - 28 - HUD_MARGIN;

    this.toolbarGroup.x = vw - TOOLBAR_WIDTH - HUD_MARGIN;
    this.toolbarGroup.y = vh - TOOLBAR_HEIGHT - INVENTORY_PANEL_HEIGHT - HUD_MARGIN;
  }

  setToolbarCallbacks(opts: {
    onWait?: () => void;
    onSearch?: () => void;
    onInventory?: () => void;
    onQuickSlot?: (item: any) => void;
  }): void {
    this.toolbar.setCallbacks(opts);
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
    this.menuPane.refresh();
  }

  update(): void {
    this.gameLog.update();
  }

  setEnabled(_enabled: boolean): void {
    this.container.eventMode = _enabled ? 'static' : 'none';
    this.toolbar.setEnabled(_enabled);
  }
}
