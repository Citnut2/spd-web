import { Container } from 'pixi.js';
import { gate } from '../utils/Geom';
import { Renderer } from './Renderer';

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

  /** Max scroll in virtual pixels (set when level dimensions are known) */
  maxScrollX = 0;
  maxScrollY = 0;

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'static';
  }

  get x(): number { return this._x; }
  get y(): number { return this._y; }

  /** Snap camera immediately to a virtual pixel position */
  snapTo(virtualX: number, virtualY: number): void {
    this._targetX = virtualX - Renderer.VIRTUAL_WIDTH / 2;
    this._targetY = virtualY - Renderer.VIRTUAL_HEIGHT / 2;
    this._x = this._targetX;
    this._y = this._targetY;
  }

  /** Center camera on a virtual pixel position (smooth pan via update()) */
  centerOn(virtualX: number, virtualY: number): void {
    this._targetX = virtualX - Renderer.VIRTUAL_WIDTH / 2;
    this._targetY = virtualY - Renderer.VIRTUAL_HEIGHT / 2;
  }

  /** Snap camera immediately to a tile cell */
  snapToCell(cell: number, mapWidth: number): void {
    const tileX = (cell % mapWidth) * Renderer.TILE_SIZE + Renderer.TILE_SIZE / 2;
    const tileY = Math.floor(cell / mapWidth) * Renderer.TILE_SIZE + Renderer.TILE_SIZE / 2;
    this.snapTo(tileX, tileY);
  }

  /** Set camera target to a tile cell (smooth pan via update()) */
  centerOnCell(cell: number, mapWidth: number): void {
    const tileX = (cell % mapWidth) * Renderer.TILE_SIZE + Renderer.TILE_SIZE / 2;
    const tileY = Math.floor(cell / mapWidth) * Renderer.TILE_SIZE + Renderer.TILE_SIZE / 2;
    this.centerOn(tileX, tileY);
  }

  addShake(amountX: number, amountY: number): void {
    this._shakeX += amountX;
    this._shakeY += amountY;
  }

  update(): void {
    // Smooth pan
    this._x += (this._targetX - this._x) * this.panSpeed;
    this._y += (this._targetY - this._y) * this.panSpeed;

    // Clamp to bounds
    this._x = gate(0, this._x, this.maxScrollX);
    this._y = gate(0, this._y, this.maxScrollY);

    // Shake decay
    this._shakeX *= this.shakeDecay;
    this._shakeY *= this.shakeDecay;
    if (Math.abs(this._shakeX) < 0.5) this._shakeX = 0;
    if (Math.abs(this._shakeY) < 0.5) this._shakeY = 0;

    this.container.x = -Math.round(this._x + this._shakeX);
    this.container.y = -Math.round(this._y + this._shakeY);
  }

  /** Set map bounds so camera knows where to stop */
  setBounds(mapWidthTiles: number, mapHeightTiles: number): void {
    this.maxScrollX = Math.max(0, mapWidthTiles * Renderer.TILE_SIZE - Renderer.VIRTUAL_WIDTH);
    this.maxScrollY = Math.max(0, mapHeightTiles * Renderer.TILE_SIZE - Renderer.VIRTUAL_HEIGHT);
  }

  /** Convert screen position to world cell */
  screenToCell(screenX: number, screenY: number, zoom: number, mapWidth: number): number {
    const worldX = screenX / zoom + this._x;
    const worldY = screenY / zoom + this._y;
    const tileX = Math.floor(worldX / Renderer.TILE_SIZE);
    const tileY = Math.floor(worldY / Renderer.TILE_SIZE);
    return tileY * mapWidth + tileX;
  }
}
