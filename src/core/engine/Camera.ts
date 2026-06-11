import { Container } from 'pixi.js';
import { gate } from '../utils/Geom';

export class Camera {
  readonly container: Container;

  private _x = 0;
  private _y = 0;
  private _targetX = 0;
  private _targetY = 0;
  private _shakeX = 0;
  private _shakeY = 0;
  private panSpeed = 0.1;
  private shakeDecay = 0.9;

  maxScrollX = 0;
  maxScrollY = 0;

  private _viewportWidth = 160;
  private _viewportHeight = 144;

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'static';
  }

  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get viewportWidth(): number { return this._viewportWidth; }
  get viewportHeight(): number { return this._viewportHeight; }

  setViewportSize(vw: number, vh: number): void {
    this._viewportWidth = vw;
    this._viewportHeight = vh;
  }

  snapTo(virtualX: number, virtualY: number): void {
    this._targetX = virtualX - this._viewportWidth / 2;
    this._targetY = virtualY - this._viewportHeight / 2;
    this._x = this._targetX;
    this._y = this._targetY;
  }

  centerOn(virtualX: number, virtualY: number): void {
    this._targetX = virtualX - this._viewportWidth / 2;
    this._targetY = virtualY - this._viewportHeight / 2;
  }

  snapToCell(cell: number, mapWidth: number, tileSize = 16): void {
    const tileX = (cell % mapWidth) * tileSize + tileSize / 2;
    const tileY = Math.floor(cell / mapWidth) * tileSize + tileSize / 2;
    this.snapTo(tileX, tileY);
  }

  centerOnCell(cell: number, mapWidth: number, tileSize = 16): void {
    const tileX = (cell % mapWidth) * tileSize + tileSize / 2;
    const tileY = Math.floor(cell / mapWidth) * tileSize + tileSize / 2;
    this.centerOn(tileX, tileY);
  }

  addShake(amountX: number, amountY: number): void {
    this._shakeX += amountX;
    this._shakeY += amountY;
  }

  update(): void {
    this._x += (this._targetX - this._x) * this.panSpeed;
    this._y += (this._targetY - this._y) * this.panSpeed;

    this._x = gate(0, this._x, this.maxScrollX);
    this._y = gate(0, this._y, this.maxScrollY);

    this._shakeX *= this.shakeDecay;
    this._shakeY *= this.shakeDecay;
    if (Math.abs(this._shakeX) < 0.5) this._shakeX = 0;
    if (Math.abs(this._shakeY) < 0.5) this._shakeY = 0;

    this.container.x = -Math.round(this._x + this._shakeX);
    this.container.y = -Math.round(this._y + this._shakeY);
  }

  setBounds(mapWidthTiles: number, mapHeightTiles: number, tileSize = 16): void {
    this.maxScrollX = Math.max(0, mapWidthTiles * tileSize - this._viewportWidth);
    this.maxScrollY = Math.max(0, mapHeightTiles * tileSize - this._viewportHeight);
  }

  screenToCell(
    screenX: number,
    screenY: number,
    mapWidth: number,
    tileSize = 16,
    toVirtual: (sx: number, sy: number) => { x: number; y: number },
  ): number {
    const v = toVirtual(screenX, screenY);
    const worldX = v.x + this._x;
    const worldY = v.y + this._y;
    const tileX = Math.floor(worldX / tileSize);
    const tileY = Math.floor(worldY / tileSize);
    return tileY * mapWidth + tileX;
  }
}
