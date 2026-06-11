// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.watabou.utils.Graph

import { Room } from '../levels/rooms/Room';

export interface GraphNode {
  distance: number;
  setDistance(value: number): void;
  distanceVal(): number;
  price: number;
  setPrice(value: number): void;
  priceVal(): number;
  edges(): Room[];
}

export class Graph {

  static setPrice(nodes: GraphNode[], value: number): void {
    for (const node of nodes) {
      node.setPrice(value);
    }
  }

  static buildDistanceMap(nodes: GraphNode[], focus: GraphNode): void {
    for (const node of nodes) {
      node.setDistance(Number.MAX_SAFE_INTEGER);
    }

    const queue: GraphNode[] = [];

    focus.setDistance(0);
    queue.push(focus);

    while (queue.length > 0) {
      const node = queue.shift()!;
      const distance = node.distanceVal();
      const price = node.priceVal();

      for (const edge of node.edges()) {
        if (edge.distanceVal() > distance + price) {
          queue.push(edge);
          edge.setDistance(distance + price);
        }
      }
    }
  }

  static buildPath<T extends GraphNode>(_nodes: T[], from: T, to: T): T[] | null {
    const path: T[] = [];

    let room: T = from;
    while (room !== to) {
      let min = room.distanceVal();
      let next: T | null = null;

      for (const edge of room.edges()) {
        const dist = edge.distanceVal();
        if (dist < min) {
          min = dist;
          next = edge as unknown as T;
        }
      }

      if (next == null) {
        return null;
      }

      path.push(next);
      room = next;
    }

    return path;
  }
}
