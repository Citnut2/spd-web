// SPDX-License-Identifier: GPL-3.0-only
// This file is part of spd-clone, a port of Shattered Pixel Dungeon.
// See <https://github.com/anomalyco/spd-clone> for copying permission.
//
// Port of com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom (factory part)

import { ConnectionRoom } from './ConnectionRoom';
import { TunnelRoom } from './TunnelRoom';
import { BridgeRoom } from './BridgeRoom';
import { PerimeterRoom } from './PerimeterRoom';
import { WalkwayRoom } from './WalkwayRoom';
import { RingTunnelRoom } from './RingTunnelRoom';
import { RingBridgeRoom } from './RingBridgeRoom';
import { Dungeon } from '../../Dungeon';
import * as Random from '../../../utils/Random';

type ConnectionRoomCtor = new () => ConnectionRoom;

const roomCtors: ConnectionRoomCtor[] = [
  TunnelRoom,
  BridgeRoom,
  PerimeterRoom,
  WalkwayRoom,
  RingTunnelRoom,
  RingBridgeRoom,
];

const chances: (number[] | undefined)[] = [];
chances[1] = [20, 1, 0, 2, 2, 1];
chances[4] = chances[3] = chances[2] = chances[1];
chances[5] = [20, 0, 0, 0, 0, 0];

chances[6] = [0, 0, 22, 3, 0, 0];
chances[10] = chances[9] = chances[8] = chances[7] = chances[6];

chances[11] = [12, 0, 0, 5, 5, 3];
chances[15] = chances[14] = chances[13] = chances[12] = chances[11];

chances[16] = [0, 0, 18, 3, 3, 1];
chances[20] = chances[19] = chances[18] = chances[17] = chances[16];

chances[21] = chances[5];

chances[22] = [15, 4, 0, 2, 3, 2];
chances[26] = chances[25] = chances[24] = chances[23] = chances[22];

export function createConnectionRoom(): ConnectionRoom {
  const depthChances = chances[Dungeon.depth];
  const chosenChances = depthChances ?? chances.find(c => c != null)!;
  const idx = Random.chances(chosenChances);
  const ctor = roomCtors[idx]!;
  return new ctor();
}
