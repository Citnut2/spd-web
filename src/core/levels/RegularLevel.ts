import { Level } from './Level';
import { Room } from './rooms/Room';
import { StandardRoom } from './rooms/standard/StandardRoom';
import { Builder } from './builders/Builder';
import { LoopBuilder } from './builders/LoopBuilder';
import { RegularPainter } from './painters/RegularPainter';
import { Painter } from './painters/Painter';
import { Terrain } from './Terrain';
import { Dungeon } from './Dungeon';
import * as Random from '../utils/Random';
import { cellToPoint } from '../utils/Geom';
import { Generator } from '../items/Generator';
import {
  createSpecialRoom,
  initForFloor as initSpecialsForFloor,
} from './rooms/special/index';

export abstract class RegularLevel extends Level {

  rooms: Room[] = [];
  levelBuilder: Builder | null = null;
  roomEntrance: Room | null = null;
  roomExit: Room | null = null;

  itemsToSpawn: any[] = [];

  override build(): boolean {
    const builder = this.builder();

    let builtRooms: Room[] | null = null;

    for (let attempt = 0; attempt < 100 && builtRooms === null; attempt++) {
      const rooms = this.initRooms();
      Random.shuffle(rooms);
      builtRooms = builder.build(rooms.slice());
    }

    if (builtRooms === null) return false;

    this.rooms = builtRooms;
    this.roomEntrance = builtRooms.find(r => r.isEntrance()) || null;
    this.roomExit = builtRooms.find(r => r.isExit()) || null;

    this.setLevelSize(this.rooms);

    const painter = this.painter();
    return painter.paint(this, this.rooms);
  }

  protected initRooms(): Room[] {
    const rooms: Room[] = [];

    const entrance = new EntranceRoom();
    entrance.setSize();
    rooms.push(entrance);
    this.roomEntrance = entrance;

    const exit = new ExitRoom();
    exit.setSize();
    rooms.push(exit);
    this.roomExit = exit;

    const stdCount = this.standardRooms(false);
    for (let i = 0; i < stdCount; i++) {
      const r = new EmptyRoom();
      r.setSize();
      rooms.push(r);
    }

    const specCount = this.specialRooms(false);
    initSpecialsForFloor();
    for (let i = 0; i < specCount; i++) {
      const r = createSpecialRoom();
      if (r) {
        r.setSize();
        rooms.push(r);
      }
    }

    return rooms;
  }

  standardRooms(forceMax: boolean): number {
    return forceMax ? 6 : 4 + Random.chances([1, 3, 1]);
  }

  specialRooms(forceMax: boolean): number {
    return forceMax ? 2 : 1 + Random.chances([1, 4]);
  }

  protected builder(): Builder {
    return new LoopBuilder()
      .setLoopShape(2, Random.Float(0, 0.65), Random.Float(0, 0.50));
  }

  protected abstract painter(): RegularPainter;

  room(pos: number): Room | null {
    const p = cellToPoint(pos, this.width);
    for (const r of this.rooms) {
      if (r.inside(p)) return r;
    }
    return null;
  }

  override randomDropCell(): number {
    let cell: number;
    let attempts = 0;
    do {
      cell = this.getRandomEmptyCell();
      attempts++;
      if (attempts > 100) return this.entrance;
    } while (this.room(cell) === null ||
             this.room(cell)!.isEntrance() ||
             this.room(cell)!.isExit());
    return cell;
  }

  override mobLimit(): number {
    if (Dungeon.depth === 1) return 8;
    return 3 + Dungeon.depth % 5 + Random.Int(3);
  }

  override createMobs(): void {
    const limit = this.mobLimit();
    for (let i = 0; i < limit; i++) {
      const mob = this.createMob();
      if (mob === null) continue;
      let pos: number;
      let attempts = 0;
      do {
        pos = this.getRandomEmptyCell();
        attempts++;
        if (attempts > 100) break;
      } while (pos === this.entrance ||
               (this.room(pos) !== null && this.room(pos)!.isEntrance()));
      mob.pos = pos;
      this.mobs.push(mob);
    }
  }

  override createItems(): void {
    const nItems = 3 + Random.chances([6, 3, 1]);
    for (let i = 0; i < nItems; i++) {
      const toDrop = Generator.random();
      const cell = this.randomDropCell();
      if (this.map[cell] === Terrain.HIGH_GRASS || this.map[cell] === Terrain.FURROWED_GRASS) {
        this.map[cell] = Terrain.GRASS;
      }
      this.drop(toDrop, cell);
    }
  }

  private setLevelSize(rooms: Room[]): void {
    let minLeft = Number.MAX_SAFE_INTEGER;
    let minTop = Number.MAX_SAFE_INTEGER;
    let maxRight = 0;
    let maxBottom = 0;

    for (const r of rooms) {
      if (r.left < minLeft) minLeft = r.left;
      if (r.top < minTop) minTop = r.top;
      if (r.right > maxRight) maxRight = r.right;
      if (r.bottom > maxBottom) maxBottom = r.bottom;
    }

    const width = maxRight - minLeft + 3;
    const height = maxBottom - minTop + 3;

    this.setSize(width, height);

    const shiftX = 1 - minLeft;
    const shiftY = 1 - minTop;
    for (const r of rooms) {
      r.shift(shiftX, shiftY);
    }
  }
}

class EntranceRoom extends StandardRoom {
  override isEntrance(): boolean {
    return true;
  }

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.EMPTY);
    const center = this.center();
    level.entrance = center.y * level.width + center.x;
    level.map[level.entrance] = Terrain.ENTRANCE;
  }
}

class ExitRoom extends StandardRoom {
  override isExit(): boolean {
    return true;
  }

  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.EMPTY);
    const center = this.center();
    level.exit = center.y * level.width + center.x;
    level.map[level.exit] = Terrain.EXIT;
  }
}

class EmptyRoom extends StandardRoom {
  override paint(level: Level): void {
    Painter.fill(level, this, Terrain.EMPTY);
  }
}
