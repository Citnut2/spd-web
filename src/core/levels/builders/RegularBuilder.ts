// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.builders.RegularBuilder

import { Builder } from './Builder';
import { Room } from '../rooms/Room';
import * as Random from '../../utils/Random';
import { StandardRoom } from '../rooms/standard/StandardRoom';
import { ConnectionRoom } from '../rooms/connection/ConnectionRoom';

export abstract class RegularBuilder extends Builder {
  protected pathVariance = 45;

  setPathVariance(var_: number): this {
    this.pathVariance = var_;
    return this;
  }

  protected pathLength = 0.25;
  protected pathLenJitterChances: number[] = [0, 0, 0, 1];

  setPathLength(len: number, jitter: number[]): this {
    this.pathLength = len;
    this.pathLenJitterChances = jitter;
    return this;
  }

  protected pathTunnelChances: number[] = [2, 2, 1];
  protected branchTunnelChances: number[] = [1, 1, 0];

  setTunnelLength(path: number[], branch: number[]): this {
    this.pathTunnelChances = path;
    this.branchTunnelChances = branch;
    return this;
  }

  protected extraConnectionChance = 0.3;

  setExtraConnectionChance(chance: number): this {
    this.extraConnectionChance = chance;
    return this;
  }

  protected entrance: Room | null = null;
  protected exit: Room | null = null;
  protected shop: Room | null = null;

  protected mainPathRooms: Room[] = [];

  protected multiConnections: Room[] = [];
  protected singleConnections: Room[] = [];

  protected setupRooms(rooms: Room[]): void {
    for (const r of rooms) {
      r.setEmpty();
    }

    this.entrance = null;
    this.exit = null;
    this.shop = null;
    this.mainPathRooms = [];
    this.singleConnections = [];
    this.multiConnections = [];

    for (const r of rooms) {
      if (r.isEntrance()) {
        this.entrance = r;
      } else if (r.isExit()) {
        this.exit = r;
      } else if (r.maxConnections(Room.ALL) > 1) {
        this.multiConnections.push(r);
      } else if (r.maxConnections(Room.ALL) === 1) {
        this.singleConnections.push(r);
      }
    }

    this.weightRooms(this.multiConnections);
    Random.shuffle(this.multiConnections);
    this.multiConnections = [...new Set(this.multiConnections)];
    Random.shuffle(this.multiConnections);

    const jitter = Random.chances(this.pathLenJitterChances);
    let roomsOnMainPath = Math.floor(this.multiConnections.length * this.pathLength) + (jitter === -1 ? 0 : jitter);

    while (roomsOnMainPath > 0 && this.multiConnections.length > 0) {
      const r = this.multiConnections.shift()!;
      if (r instanceof StandardRoom) {
        roomsOnMainPath -= r.sizeFactor();
      } else {
        roomsOnMainPath--;
      }
      this.mainPathRooms.push(r);
    }
  }

  protected weightRooms(rooms: Room[]): void {
    const initial = [...rooms];
    for (const r of initial) {
      if (r instanceof StandardRoom) {
        const w = r.connectionWeight();
        for (let i = 1; i < w; i++) {
          rooms.push(r);
        }
      }
    }
  }

  protected createBranches(
    rooms: Room[],
    branchable: Room[],
    roomsToBranch: Room[],
    connChances: number[]
  ): boolean {
    let i = 0;
    let angle: number;
    let tries: number;
    let curr: Room;
    const connectingRoomsThisBranch: Room[] = [];
    let failedBranchAttempts = 0;
    const connectionChances = [...connChances];

    while (i < roomsToBranch.length) {
      if (failedBranchAttempts > 100) {
        return false;
      }

      const r = roomsToBranch[i]!;
      connectingRoomsThisBranch.length = 0;

      curr = Random.element(branchable);

      let connectingRooms = Random.chances(connectionChances);
      if (connectingRooms === -1) {
        for (let j = 0; j < connectionChances.length; j++) connectionChances[j] = connChances[j]!;
        connectingRooms = Random.chances(connectionChances);
      }
      if (connectingRooms >= 0) connectionChances[connectingRooms]!--;

      for (let j = 0; j < connectingRooms; j++) {
        const t = ConnectionRoom.createRoom();
        tries = 3;

        do {
          angle = Builder.placeRoom(rooms, curr, t, this.randomBranchAngle(curr));
          tries--;
        } while (angle === -1 && tries > 0);

        if (angle === -1) {
          t.clearConnections();
          for (const c of connectingRoomsThisBranch) {
            c.clearConnections();
            const idx = rooms.indexOf(c);
            if (idx !== -1) rooms.splice(idx, 1);
          }
          connectingRoomsThisBranch.length = 0;
          break;
        } else {
          connectingRoomsThisBranch.push(t);
          rooms.push(t);
        }

        curr = t;
      }

      if (connectingRoomsThisBranch.length !== connectingRooms) {
        failedBranchAttempts++;
        continue;
      }

      tries = 10;

      do {
        angle = Builder.placeRoom(rooms, curr, r, this.randomBranchAngle(curr));
        tries--;
      } while (angle === -1 && tries > 0);

      if (angle === -1) {
        r.clearConnections();
        for (const t of connectingRoomsThisBranch) {
          t.clearConnections();
          const idx = rooms.indexOf(t);
          if (idx !== -1) rooms.splice(idx, 1);
        }
        connectingRoomsThisBranch.length = 0;
        failedBranchAttempts++;
        continue;
      }

      for (let j = 0; j < connectingRoomsThisBranch.length; j++) {
        if (Random.Int(3) <= 1) branchable.push(connectingRoomsThisBranch[j]!);
      }
      if (r.maxConnections(Room.ALL) > 1 && Random.Int(3) === 0) {
        if (r instanceof StandardRoom) {
          for (let j = 0; j < r.connectionWeight(); j++) {
            branchable.push(r);
          }
        } else {
          branchable.push(r);
        }
      }

      i++;
    }

    return true;
  }

  protected randomBranchAngle(_r: Room): number {
    return Random.Float(360);
  }
}
