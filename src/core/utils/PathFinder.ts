// Port of com.watabou.utils.PathFinder

export class PathFinder {
  static width = 0;
  static height = 0;
  static size = 0;

  static distance: number[] = [];
  private static maxVal: number[] = [];

  private static queue: number[] = [];

  private static dir: number[] = [];
  private static dirLR: number[] = [];

  // Map-width-dependent neighbour offsets
  static NEIGHBOURS4: number[] = [];
  static NEIGHBOURS8: number[] = [];
  static NEIGHBOURS9: number[] = [];

  // Clockwise ordered neighbour offsets
  static CIRCLE4: number[] = [];
  static CIRCLE8: number[] = [];

  static setMapSize(width: number, height: number): void {
    PathFinder.width = width;
    PathFinder.height = height;
    PathFinder.size = width * height;

    PathFinder.distance = new Array(PathFinder.size).fill(0);
    PathFinder.queue = new Array(PathFinder.size).fill(0);
    PathFinder.maxVal = new Array(PathFinder.size).fill(Number.MAX_SAFE_INTEGER);

    PathFinder.dir = [-1, +1, -width, +width, -width - 1, -width + 1, +width - 1, +width + 1];
    PathFinder.dirLR = [-1 - width, -1, -1 + width, -width, +width, +1 - width, +1, +1 + width];

    PathFinder.NEIGHBOURS4 = [-width, -1, +1, +width];
    PathFinder.NEIGHBOURS8 = [-width - 1, -width, -width + 1, -1, +1, +width - 1, +width, +width + 1];
    PathFinder.NEIGHBOURS9 = [-width - 1, -width, -width + 1, -1, 0, +1, +width - 1, +width, +width + 1];

    PathFinder.CIRCLE4 = [-width, +1, +width, -1];
    PathFinder.CIRCLE8 = [-width - 1, -width, -width + 1, +1, +width + 1, +width, +width - 1, -1];
  }

  static find(
    from: number, to: number, passable: boolean[]
  ): number[] | null {
    if (!PathFinder.buildDistanceMap(from, to, passable)) {
      return null;
    }

    const result: number[] = [];
    let s = from;

    do {
      let minD = PathFinder.distance[s]!;
      let mins = s;

      for (const n of PathFinder.dir) {
        const cellN = s + n;
        const thisD = PathFinder.distance[cellN]!;
        if (thisD < minD) {
          minD = thisD;
          mins = cellN;
        }
      }
      s = mins;
      result.push(s);
    } while (s !== to);

    return result;
  }

  static getStep(from: number, to: number, passable: boolean[]): number {
    if (!PathFinder.buildDistanceMap(from, to, passable)) {
      return -1;
    }

    let minD = PathFinder.distance[from]!;
    let best = from;

    for (const n of PathFinder.dir) {
      const step = from + n;
      const stepD = PathFinder.distance[step]!;
      if (stepD < minD) {
        minD = stepD;
        best = step;
      }
    }

    return best;
  }

  private static buildDistanceMap(
    from: number, to: number, passable: boolean[]
  ): boolean {
    if (from === to) return false;
    if (!PathFinder.inside(from) || !PathFinder.inside(to)) return false;

    for (let i = 0; i < PathFinder.size; i++) {
      PathFinder.distance[i] = PathFinder.maxVal[i]!;
    }

    let pathFound = false;
    let head = 0;
    let tail = 0;
    const width = PathFinder.width;
    const size = PathFinder.size;

    PathFinder.queue[tail++] = to;
    PathFinder.distance[to] = 0;

    while (head < tail) {
      const step = PathFinder.queue[head++]!;
      if (step === from) {
        pathFound = true;
        break;
      }
      const nextDistance = PathFinder.distance[step]! + 1;

      const start = (step % width === 0 ? 3 : 0);
      const end = ((step + 1) % width === 0 ? 3 : 0);
      for (let i = start; i < PathFinder.dirLR.length - end; i++) {
        const n = step + PathFinder.dirLR[i]!;
        if (n === from || (n >= 0 && n < size && passable[n] && (PathFinder.distance[n]! > nextDistance))) {
          PathFinder.queue[tail++] = n;
          PathFinder.distance[n] = nextDistance;
        }
      }
    }

    return pathFound;
  }

  private static inside(cell: number): boolean {
    return cell >= 0 && cell < PathFinder.size;
  }

  static readonly NEIGHBOURS4_OFFSETS = [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  static readonly NEIGHBOURS8_OFFSETS = [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    { x: -1, y: 0 },                    { x: 1, y: 0 },
    { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 },
  ];
}
