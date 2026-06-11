export class ShadowCaster {
  static readonly MAX_DISTANCE = 20;

  static rounding: number[][] = [];

  static init(): void {
    ShadowCaster.rounding = new Array(ShadowCaster.MAX_DISTANCE + 1);
    for (let i = 1; i <= ShadowCaster.MAX_DISTANCE; i++) {
      const arr = new Array(i + 1);
      ShadowCaster.rounding[i] = arr;
      for (let j = 1; j <= i; j++) {
        arr[j] = Math.min(
          j,
          Math.round(i * Math.cos(Math.asin(j / (i + 0.5)))),
        );
      }
    }
  }

  static castShadow(
    x: number, y: number, w: number,
    fieldOfView: boolean[], blocking: boolean[], distance: number,
  ): void {
    if (ShadowCaster.rounding.length === 0) ShadowCaster.init();

    if (distance >= ShadowCaster.MAX_DISTANCE) distance = ShadowCaster.MAX_DISTANCE;

    fieldOfView.fill(false);
    fieldOfView[y * w + x] = true;

    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, 1, -1, false);
    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, -1, 1, true);
    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, 1, 1, true);
    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, 1, 1, false);
    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, -1, 1, false);
    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, 1, -1, true);
    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, -1, -1, true);
    ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0.0, 1.0, -1, -1, false);
  }

  private static scanOctant(
    distance: number, fov: boolean[], blocking: boolean[],
    row: number, x: number, y: number, w: number,
    lSlope: number, rSlope: number,
    mX: number, mY: number, mXY: boolean,
  ): void {
    let inBlocking = false;

    const roundingRow = ShadowCaster.rounding[distance];
    if (!roundingRow) return;

    const roundingAtDist = distance === 2 ? [...roundingRow] : roundingRow;
    if (distance === 2) roundingAtDist[2] = 2;

    for (; row <= distance; row++) {
      if (rSlope < lSlope) return;

      const maxEnd = roundingAtDist[row] as number | undefined;
      if (maxEnd === undefined) continue;

      const start = lSlope === 0 ? 0 : Math.floor((row - 0.5) * lSlope + 0.499);
      const end = rSlope === 1
        ? maxEnd
        : Math.min(maxEnd, Math.ceil((row + 0.5) * rSlope - 0.499));

      let cell = x + y * w;
      if (mXY) cell += mX * start * w + mY * row;
      else cell += mX * start + mY * row * w;

      for (let col = start; col <= end; col++) {
        if (col === end && inBlocking &&
            Math.ceil((row - 0.5) * rSlope - 0.499) !== end) {
          break;
        }

        if (cell >= 0 && cell < fov.length) {
          fov[cell] = true;

          if (blocking[cell]) {
            if (!inBlocking) {
              inBlocking = true;
              if (col !== start) {
                ShadowCaster.scanOctant(
                  distance, fov, blocking, row + 1, x, y, w,
                  lSlope, (col - 0.5) / (row + 0.5),
                  mX, mY, mXY,
                );
              }
            }
          } else {
            if (inBlocking) {
              inBlocking = false;
              lSlope = (col - 0.5) / (row - 0.5);
            }
          }
        }

        if (!mXY) cell += mX;
        else cell += mX * w;
      }

      if (inBlocking) return;
    }
  }
}
