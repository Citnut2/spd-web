// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.builders.LoopBuilder

import { RegularBuilder } from './RegularBuilder';
import { Builder } from './Builder';
import { Room } from '../rooms/Room';
import { createConnectionRoom } from '../rooms/connection/ConnectionRoomFactory';
import { PointF } from '../../utils/Geom';
import * as Random from '../../utils/Random';

export class LoopBuilder extends RegularBuilder {
  private curveExponent = 0;
  private curveIntensity = 1;
  private curveOffset = 0;

  setLoopShape(exponent: number, intensity: number, offset: number): this {
    this.curveExponent = Math.abs(exponent);
    this.curveIntensity = intensity % 1;
    this.curveOffset = offset % 0.5;
    return this;
  }

  private targetAngle(percentAlong: number): number {
    percentAlong += this.curveOffset;
    return 360 * (
      this.curveIntensity * this.curveEquation(percentAlong)
      + (1 - this.curveIntensity) * (percentAlong)
      - this.curveOffset
    );
  }

  private curveEquation(x: number): number {
    const mod = (x % 0.5) - 0.25;
    return Math.pow(4, 2 * this.curveExponent)
      * Math.pow(mod, 2 * this.curveExponent + 1)
      + 0.25 + 0.5 * Math.floor(2 * x);
  }

  private loopCenter: PointF | null = null;

  override build(rooms: Room[]): Room[] | null {
    this.setupRooms(rooms);

    if (this.entrance === null) {
      return null;
    }

    this.entrance.setSize();
    this.entrance.setPos(0, 0);

    const startAngle = Random.Float(0, 360);

    this.mainPathRooms.unshift(this.entrance);
    if (this.exit !== null) {
      this.mainPathRooms.splice(Math.floor((this.mainPathRooms.length + 1) / 2), 0, this.exit);
    }

    const loop: Room[] = [];
    const pathTunnels = [...this.pathTunnelChances];

    for (const r of this.mainPathRooms) {
      loop.push(r);

      let tunnels = Random.chances(pathTunnels);
      if (tunnels === -1) {
        for (let j = 0; j < pathTunnels.length; j++) pathTunnels[j] = this.pathTunnelChances[j]!;
        tunnels = Random.chances(pathTunnels);
      }
      if (tunnels >= 0) pathTunnels[tunnels]!--;

      for (let j = 0; j < tunnels; j++) {
        loop.push(createConnectionRoom());
      }
    }

    let prev = this.entrance;
    for (let i = 1; i < loop.length; i++) {
      const r = loop[i]!;
      const target = startAngle + this.targetAngle(i / loop.length);
      if (Builder.placeRoom(rooms, prev, r, target) !== -1) {
        prev = r;
        if (!rooms.includes(prev)) {
          rooms.push(prev);
        }
      } else {
        return null;
      }
    }

    while (!prev.connect(this.entrance)) {
      const c = createConnectionRoom();
      if (Builder.placeRoom(loop, prev, c, Builder.angleBetweenRooms(prev, this.entrance)) === -1) {
        return null;
      }
      loop.push(c);
      rooms.push(c);
      prev = c;
    }

    if (this.shop !== null) {
      let angle: number;
      let tries = 10;
      do {
        angle = Builder.placeRoom(loop, this.entrance, this.shop, Random.Float(360));
        tries--;
      } while (angle === -1 && tries >= 0);
      if (angle === -1) return null;
    }

    this.loopCenter = { x: 0, y: 0 };
    for (const r of loop) {
      this.loopCenter.x += (r.left + r.right) / 2;
      this.loopCenter.y += (r.top + r.bottom) / 2;
    }
    this.loopCenter.x /= loop.length;
    this.loopCenter.y /= loop.length;

    const branchable: Room[] = [...loop];

    const roomsToBranch: Room[] = [
      ...this.multiConnections,
      ...this.singleConnections,
    ];
    this.weightRooms(branchable);
    if (!this.createBranches(rooms, branchable, roomsToBranch, this.branchTunnelChances)) {
      return null;
    }

    Builder.findNeighbours(rooms);

    for (const r of rooms) {
      for (const n of r.neighbours) {
        if (!n.connected.has(r) && Random.Float() < this.extraConnectionChance) {
          r.connect(n);
        }
      }
    }

    return rooms;
  }

  protected override randomBranchAngle(r: Room): number {
    if (this.loopCenter === null) {
      return super.randomBranchAngle(r);
    }

    const center: PointF = {
      x: (r.left + r.right) / 2,
      y: (r.top + r.bottom) / 2,
    };
    let toCenter = Builder.angleBetweenPoints(center, this.loopCenter);
    if (toCenter < 0) toCenter += 360;

    let currAngle = Random.Float(360);
    for (let i = 0; i < 4; i++) {
      const newAngle = Random.Float(360);
      if (Math.abs(toCenter - newAngle) < Math.abs(toCenter - currAngle)) {
        currAngle = newAngle;
      }
    }
    return currAngle;
  }
}
