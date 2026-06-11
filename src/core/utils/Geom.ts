// Port of com.watabou.utils.Point, PointF, Rect, RectF, GameMath

export interface Point {
  x: number;
  y: number;
}

export function point(x: number, y: number): Point {
  return { x, y };
}

export function pointClone(p: Point): Point {
  return { x: p.x, y: p.y };
}

export function pointEquals(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function pointDistance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export interface PointF {
  x: number;
  y: number;
}

export function pointF(x: number, y: number): PointF {
  return { x, y };
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function rect(left: number, top: number, right: number, bottom: number): Rect {
  return { left, top, right, bottom };
}

export function rectWidth(r: Rect): number {
  return r.right - r.left;
}

export function rectHeight(r: Rect): number {
  return r.bottom - r.top;
}

export function rectCenter(r: Rect): PointF {
  return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
}

export function rectInside(r: Rect, p: Point): boolean {
  return p.x >= r.left && p.x < r.right && p.y >= r.top && p.y < r.bottom;
}

export interface RectF {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// GameMath port
export function gate(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sinInRange(angle: number, min: number, max: number): number {
  return min + (max - min) * (1 + Math.sin(angle)) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Point-to-cell conversion for tile maps
export function cellToPoint(cell: number, mapWidth: number): Point {
  return { x: cell % mapWidth, y: Math.floor(cell / mapWidth) };
}

export function pointToCell(p: Point, mapWidth: number): number {
  return p.y * mapWidth + p.x;
}

export function distanceBetweenCells(a: number, b: number, mapWidth: number): number {
  const ax = a % mapWidth;
  const ay = Math.floor(a / mapWidth);
  const bx = b % mapWidth;
  const by = Math.floor(b / mapWidth);
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}
