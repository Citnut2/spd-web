import { Scene } from '../Scene';
import { Assets, Container } from 'pixi.js';
import { Dungeon } from '../../core/levels/Dungeon';
import { DungeonRenderer } from '../../core/rendering/DungeonRenderer';
import { FogOfWar } from '../../core/rendering/FogOfWar';
import { HeroSprite } from '../../core/sprites/HeroSprite';
import { RatSprite } from '../../core/sprites/RatSprite';
import { SlimeSprite } from '../../core/sprites/SlimeSprite';
import { CharSprite } from '../../core/sprites/CharSprite';
import { Camera } from '../../core/engine/Camera';
import { ViewportManager } from '../../core/engine/ViewportManager';
import { SPDGame } from '../../core/engine/SPDGame';
import { Char } from '../../core/actors/Char';
import { Hero, HeroClass } from '../../core/hero/Hero';
import { Mob } from '../../core/actors/mobs/Mob';
import { Game } from '../../core/engine/Game';
import { HUD } from '../HUD';
import { GLog } from '../GLog';
import { PathFinder } from '../../core/utils/PathFinder';
import { WndBag } from '../windows/WndBag';
import { setDropItem } from '../../core/items/Item';

export class GameScene extends Scene {
  private cameraRef: Camera | null = null;
  private dungeonRenderer: DungeonRenderer | null = null;
  private fogOfWar: FogOfWar | null = null;
  private heroSprite: HeroSprite | null = null;
  private mobSprites: CharSprite[] = [];
  private hud: HUD | null = null;
  private spdGame: SPDGame | null = null;
  private mapWidth = 38;
  private isBusy = false;
  private pathQueue: number[] = [];
  private uiLayerRef: Container | null = null;

  setCamera(camera: Camera): void {
    this.cameraRef = camera;
  }

  async create(): Promise<void> {
    const level = Dungeon.level;
    if (!level) {
      console.warn('GameScene: no level — initializing');
      Dungeon.initHero(HeroClass.WARRIOR);
      Dungeon.newLevel();
    }
    const lvl = Dungeon.level!;
    this.mapWidth = lvl.width;
    PathFinder.setMapSize(lvl.width, lvl.height);
    const hero = Dungeon.hero;

    this.spdGame = Game.instance as SPDGame;
    if (!this.cameraRef) {
      this.cameraRef = this.spdGame.camera;
    }
    if (!this.cameraRef || !hero) return;

    this.uiLayerRef = this.spdGame.uiLayer;

    const waterPath = lvl.waterTex();
    if (waterPath) {
      await Assets.load(waterPath);
    }
    const [heroTex, ratTex, slimeTex] = await Promise.all([
      Assets.load('assets/sprites/warrior.png'),
      Assets.load('assets/sprites/rat.png'),
      Assets.load('assets/sprites/slime.png'),
    ]);

    this.dungeonRenderer = new DungeonRenderer(this.cameraRef);
    await this.dungeonRenderer.loadTileSheet('assets/environment/tiles_sewers.png');
    this.dungeonRenderer.setLevel(lvl);

    this.heroSprite = new HeroSprite();
    this.heroSprite.init(heroTex);
    this.heroSprite.link(hero, this.mapWidth);
    this.heroSprite.updateSprite(this.mapWidth);
    this.heroSprite.idle();
    this.dungeonRenderer.sprites.addChild(this.heroSprite);

    for (const mob of lvl.mobs as Mob[]) {
      let sprite: CharSprite;
      if (mob.constructor.name === 'Rat') {
        sprite = new RatSprite();
        (sprite as RatSprite).init(ratTex);
      } else {
        sprite = new SlimeSprite();
        (sprite as SlimeSprite).init(slimeTex);
      }
      sprite.link(mob, this.mapWidth);
      sprite.updateSprite(this.mapWidth);
      if ('idle' in sprite) sprite.idle();
      this.mobSprites.push(sprite);
      this.dungeonRenderer.sprites.addChild(sprite);
    }

    this.fogOfWar = new FogOfWar(lvl.width, lvl.height);
    this.container.addChild(this.dungeonRenderer.container);
    this.container.addChild(this.fogOfWar);

    this.updateFogAndVisibility(hero);

    this.cameraRef.snapToCell(hero.pos, this.mapWidth);
    this.cameraRef.update();

    setDropItem((item, pos) => {
      const lvl = Dungeon.level;
      if (lvl) lvl.drop(item, pos);
    });

    this.hud = new HUD(hero);
    this.hud.positionElements(this.spdGame.viewport);
    this.uiLayerRef.addChild(this.hud.container);

    this.hud.toolbar.setCallbacks({
      onWait: () => {
        const h = Dungeon.hero;
        if (!h || !h.isAlive()) return;
        const level = Dungeon.level;
        if (!level) return;
        this.isBusy = true;
        h.spend(1);
        this.processTurn(h, level);
      },
      onInventory: () => {
        const h = Dungeon.hero;
        if (!h) return;
        const vm = this.spdGame!.viewport;
        const wnd = new WndBag(h);
        wnd.x = (vm.viewportWidth - WndBag.WIDTH) / 2;
        wnd.y = (vm.viewportHeight - WndBag.HEIGHT) / 2;
        this.uiLayerRef!.addChild(wnd);
        wnd.on('removed', () => {
          this.hud?.refresh();
        });
      },
      onSearch: () => {
        GLog.add('@@Searching...');
      },
    });

    this.setupInput();
    this.setupPointerInput();
  }

  private updateFogAndVisibility(hero: Char): void {
    const level = Dungeon.level;
    if (!level) return;
    level.updateFieldOfView();
    level.heroFOV[hero.pos] = true;
    for (let i = 0; i < level.length; i++) {
      if (level.heroFOV[i]) {
        level.visited[i] = true;
      }
    }
    this.fogOfWar?.updateFog();
    this.fogOfWar?.updateTexture(
      level.heroFOV,
      level.visited,
      level.mapped,
      level.map,
      level.discoverable,
      0,
    );
  }

  private setupInput(): void {
    const handler = (e: KeyboardEvent) => {
      if (this.isBusy) return;
      const level = Dungeon.level;
      const hero = Dungeon.hero;
      if (!level || !hero || !hero.isAlive()) return;

      let target = hero.pos;
      switch (e.key) {
        case 'ArrowUp': case 'w': target = hero.pos - this.mapWidth; break;
        case 'ArrowDown': case 's': target = hero.pos + this.mapWidth; break;
        case 'ArrowLeft': case 'a': target = hero.pos - 1; break;
        case 'ArrowRight': case 'd': target = hero.pos + 1; break;
        default: return;
      }

      e.preventDefault();

      if (target < 0 || target >= level.length) return;
      if (level.solid[target]) return;

      const oldPos = hero.pos;

      let enemy: Char | null = null;
      for (const mob of level.mobs as Mob[]) {
        if (mob.pos === target && mob.isAlive()) {
          enemy = mob;
          break;
        }
      }

      if (enemy) {
        hero.attack(enemy);
        if (!enemy.isAlive()) {
          hero.gainExp((enemy as Mob).EXP || 1);
        }
        if (enemy && !enemy.isAlive()) {
          const idx = this.mobSprites.indexOf(
            this.mobSprites.find(s => (s as unknown as Record<string, unknown>)['ch'] === enemy)!,
          );
          if (idx >= 0) {
            (this.mobSprites[idx] as CharSprite).visible = false;
          }
        }
      } else {
        hero.moveTo(target);
        this.heroSprite?.startMove(oldPos, hero.pos, this.mapWidth, () => {
          this.onMoveComplete(hero);
        });
        this.isBusy = true;
        return;
      }

      this.processTurn(hero, level);
    };

    window.addEventListener('keydown', handler);
    this._keyHandler = handler as EventListener;
  }

  private _keyHandler: EventListener | null = null;

  private setupPointerInput(): void {
    this.container.eventMode = 'static';
    this.container.on('pointerdown', (e: any) => {
      if (this.isBusy || !Dungeon.hero?.isAlive()) return;
      const level = Dungeon.level;
      const hero = Dungeon.hero;
      if (!level || !hero || !this.cameraRef || !this.spdGame) return;

      const cell = this.cameraRef.screenToCell(
        e.globalX, e.globalY, this.mapWidth, 16,
        (sx, sy) => this.spdGame!.viewport.screenToVirtual(sx, sy),
      );
      if (cell < 0 || cell >= level.length) return;

      this.handleCellClick(cell, hero, level);
    });
  }

  private handleCellClick(cell: number, hero: Char, level: any): void {
    for (const mob of level.mobs as Mob[]) {
      if (mob.pos === cell && mob.isAlive()) {
        hero.attack(mob);
        if (!mob.isAlive()) (hero as Hero).gainExp((mob as Mob).EXP || 1);
        this.processTurn(hero, level);
        return;
      }
    }

    if (cell === hero.pos) return;
    if (level.solid[cell]) return;

    PathFinder.setMapSize(level.width, level.height);
    const path = PathFinder.find(hero.pos, cell, level.passable);
    if (!path || path.length === 0) return;

    this.isBusy = true;
    this.pathQueue = path;
    this.moveAlongPath(hero, level);
  }

  private moveAlongPath(hero: Char, level: any): void {
    if (this.pathQueue.length === 0) {
      this.isBusy = false;
      this.processTurn(hero, level);
      return;
    }

    const next = this.pathQueue.shift()!;

    for (const mob of level.mobs as Mob[]) {
      if (mob.pos === next && mob.isAlive()) {
        hero.attack(mob);
        if (!mob.isAlive()) (hero as Hero).gainExp((mob as Mob).EXP || 1);
        this.pathQueue = [];
        this.isBusy = false;
        this.processTurn(hero, level);
        return;
      }
    }

    if (!level.passable[next]) {
      this.pathQueue = [];
      this.isBusy = false;
      this.processTurn(hero, level);
      return;
    }

    const oldPos = hero.pos;
    hero.moveTo(next);
    this.heroSprite?.startMove(oldPos, hero.pos, this.mapWidth, () => {
      this.moveAlongPath(hero, level);
    });
  }

  private onMoveComplete(hero: Char): void {
    const level = Dungeon.level;
    if (!level) return;

    const heap = level.heaps.get(hero.pos);
    if (heap && !heap.isEmpty() && hero instanceof Hero) {
      const items = [...heap.items];
      for (const item of items) {
        item.doPickUp();
        if (item.collect(hero.belongings.backpack)) {
          heap.remove(item);
        }
      }
      if (heap.isEmpty()) {
        heap.destroy();
        level.heaps.delete(hero.pos);
      }
    }

    this.processTurn(hero, level);
  }

  private processTurn(hero: Char, level: any): void {
    for (const mob of level.mobs as Mob[]) {
      if (!mob.isAlive()) continue;
      mob.actAI();
    }

    level.updateFieldOfView();
    this.updateFogAndVisibility(hero);

    this.cameraRef?.centerOnCell(hero.pos, this.mapWidth);

    this.hud?.refresh();
    this.hud?.setEnabled(true);
    this.isBusy = false;
  }

  update(): void {
    const dt = 1 / 60;
    if (this.heroSprite) {
      this.heroSprite.updateMove(dt);
    }
    for (const s of this.mobSprites) {
      s.updateMove(dt);
    }
    if (this.cameraRef) {
      this.cameraRef.update();
    }
    if (this.dungeonRenderer) {
      this.dungeonRenderer.update(dt);
    }
    this.hud?.update();
  }

  onResize(viewport: ViewportManager): void {
    if (this.hud) {
      this.hud.positionElements(viewport);
    }
  }

  destroy(): void {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
    }
    if (this.hud) {
      this.hud.container.removeFromParent();
      this.hud = null;
    }
    this.mobSprites = [];
    this.heroSprite = null;
    this.fogOfWar = null;
    this.dungeonRenderer = null;
    this.uiLayerRef = null;
    this.spdGame = null;
    super.destroy();
  }
}
