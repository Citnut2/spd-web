import { describe, it, expect } from 'vitest';
import {
  point, pointClone, pointEquals, pointDistance,
  pointF,
  rect, rectWidth, rectHeight, rectCenter, rectInside,
  gate, sinInRange, lerp,
  cellToPoint, pointToCell, distanceBetweenCells,
} from './Geom';

describe('Geom', () => {
  describe('Point', () => {
    it('creates a point', () => {
      const p = point(3, 5);
      expect(p.x).toBe(3);
      expect(p.y).toBe(5);
    });

    it('clones a point', () => {
      const p = point(3, 5);
      const c = pointClone(p);
      expect(c.x).toBe(3);
      expect(c.y).toBe(5);
      expect(c).not.toBe(p);
    });

    it('equals checks x and y', () => {
      expect(pointEquals(point(1, 2), point(1, 2))).toBe(true);
      expect(pointEquals(point(1, 2), point(2, 1))).toBe(false);
    });

    it('distance computes Euclidean distance', () => {
      const d = pointDistance(point(0, 0), point(3, 4));
      expect(d).toBeCloseTo(5);
    });
  });

  describe('PointF', () => {
    it('creates a pointF', () => {
      const p = pointF(1.5, 2.5);
      expect(p.x).toBe(1.5);
      expect(p.y).toBe(2.5);
    });
  });

  describe('Rect', () => {
    it('creates a rect', () => {
      const r = rect(0, 0, 10, 20);
      expect(r.left).toBe(0);
      expect(r.top).toBe(0);
      expect(r.right).toBe(10);
      expect(r.bottom).toBe(20);
    });

    it('width and height', () => {
      const r = rect(2, 3, 12, 18);
      expect(rectWidth(r)).toBe(10);
      expect(rectHeight(r)).toBe(15);
    });

    it('center returns midpoint', () => {
      const c = rectCenter(rect(0, 0, 10, 10));
      expect(c.x).toBe(5);
      expect(c.y).toBe(5);
    });

    it('inside checks containment', () => {
      const r = rect(5, 5, 15, 15);
      expect(rectInside(r, point(7, 7))).toBe(true);
      expect(rectInside(r, point(5, 5))).toBe(true);
      expect(rectInside(r, point(4, 7))).toBe(false);
      expect(rectInside(r, point(15, 15))).toBe(false);
    });
  });

  describe('GameMath', () => {
    it('gate clamps values', () => {
      expect(gate(0, 5, 10)).toBe(5);
      expect(gate(0, -3, 10)).toBe(0);
      expect(gate(0, 15, 10)).toBe(10);
    });

    it('sinInRange oscillates between min and max', () => {
      const v1 = sinInRange(0, 0, 10);
      expect(v1).toBeCloseTo(5);
      const v2 = sinInRange(Math.PI / 2, 0, 10);
      expect(v2).toBeCloseTo(10);
      const v3 = sinInRange(Math.PI * 1.5, 0, 10);
      expect(v3).toBeCloseTo(0);
    });

    it('lerp interpolates linearly', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });

  describe('Cell conversion', () => {
    const mapWidth = 38;

    it('cellToPoint converts 1D index to 2D', () => {
      expect(cellToPoint(0, mapWidth)).toEqual(point(0, 0));
      expect(cellToPoint(38, mapWidth)).toEqual(point(0, 1));
      expect(cellToPoint(39, mapWidth)).toEqual(point(1, 1));
    });

    it('pointToCell converts 2D to 1D', () => {
      expect(pointToCell(point(0, 0), mapWidth)).toBe(0);
      expect(pointToCell(point(0, 1), mapWidth)).toBe(38);
      expect(pointToCell(point(1, 1), mapWidth)).toBe(39);
    });

    it('cellToPoint and pointToCell are inverses', () => {
      const testCells = [0, 1, 37, 38, 100, 722, 1443];
      for (const cell of testCells) {
        const p = cellToPoint(cell, mapWidth);
        expect(pointToCell(p, mapWidth)).toBe(cell);
      }
    });

    it('distanceBetweenCells computes correct distance', () => {
      const d = distanceBetweenCells(0, 3, mapWidth);
      expect(d).toBeCloseTo(3); // (0,0) to (3,0)
    });
  });
});
