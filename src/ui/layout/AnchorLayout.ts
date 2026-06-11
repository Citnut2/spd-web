import { Container } from 'pixi.js';

export const ANCHOR = {
  FILL: 'fill',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  CENTER_LEFT: 'center-left',
  CENTER: 'center',
  CENTER_RIGHT: 'center-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
} as const;

export type Anchor = (typeof ANCHOR)[keyof typeof ANCHOR];

export interface PanelSpec {
  container: Container;
  anchor: Anchor;
  width: number;
  height: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

const DEFAULT_MARGIN = 2;

export class AnchorLayout {
  private panels: PanelSpec[] = [];

  addPanel(spec: PanelSpec): void {
    this.panels.push(spec);
  }

  removePanel(container: Container): void {
    const idx = this.panels.findIndex(p => p.container === container);
    if (idx >= 0) this.panels.splice(idx, 1);
  }

  clear(): void {
    this.panels = [];
  }

  layout(vw: number, vh: number, safeTop = 0, safeBottom = 0, safeLeft = 0, safeRight = 0): void {
    const groups = this.groupByAnchor();

    for (const [anchor, specs] of groups) {
      this.layoutAnchor(anchor as Anchor, specs, vw, vh, safeTop, safeBottom, safeLeft, safeRight);
    }
  }

  private groupByAnchor(): Map<string, PanelSpec[]> {
    const groups = new Map<string, PanelSpec[]>();
    for (const p of this.panels) {
      const key = p.anchor;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    return groups;
  }

  private layoutAnchor(
    anchor: Anchor,
    specs: PanelSpec[],
    vw: number,
    vh: number,
    safeTop: number,
    safeBottom: number,
    safeLeft: number,
    safeRight: number,
  ): void {
    if (anchor === ANCHOR.FILL) {
      for (const spec of specs) {
        spec.container.x = safeLeft;
        spec.container.y = safeTop;
        spec.container.width = vw - safeLeft - safeRight;
        spec.container.height = vh - safeTop - safeBottom;
      }
      return;
    }

    if (anchor === ANCHOR.TOP_LEFT || anchor === ANCHOR.TOP_CENTER || anchor === ANCHOR.TOP_RIGHT) {
      this.layoutTop(anchor, specs, vw, safeTop, safeLeft, safeRight);
      return;
    }

    if (anchor === ANCHOR.BOTTOM_LEFT || anchor === ANCHOR.BOTTOM_CENTER || anchor === ANCHOR.BOTTOM_RIGHT) {
      this.layoutBottom(anchor, specs, vh, vw, safeBottom, safeLeft, safeRight);
      return;
    }

    if (anchor === ANCHOR.CENTER_LEFT || anchor === ANCHOR.CENTER_RIGHT || anchor === ANCHOR.CENTER) {
      this.layoutCenter(anchor, specs, vw, vh);
      return;
    }
  }

  private layoutTop(anchor: Anchor, specs: PanelSpec[], vw: number, safeTop: number, safeLeft: number, safeRight: number): void {
    let y = safeTop + DEFAULT_MARGIN;
    for (const spec of specs) {
      const ml = spec.marginLeft ?? 0;
      const mr = spec.marginRight ?? 0;
      const mt = spec.marginTop ?? 0;

      spec.container.y = y + mt;

      if (anchor === ANCHOR.TOP_LEFT) {
        spec.container.x = safeLeft + DEFAULT_MARGIN + ml;
      } else if (anchor === ANCHOR.TOP_RIGHT) {
        spec.container.x = vw - spec.width - safeRight - DEFAULT_MARGIN - mr;
      } else if (anchor === ANCHOR.TOP_CENTER) {
        spec.container.x = (vw - spec.width) / 2;
      }

      spec.container.width = spec.width;
      spec.container.height = spec.height;
      y += spec.height + mt + (spec.marginBottom ?? 0) + 1;
    }
  }

  private layoutBottom(anchor: Anchor, specs: PanelSpec[], vh: number, vw: number, safeBottom: number, safeLeft: number, safeRight: number): void {
    const totalH = specs.reduce((sum, s) => sum + s.height + (s.marginTop ?? 0) + (s.marginBottom ?? 0) + 1, 0);
    let y = vh - safeBottom - DEFAULT_MARGIN - totalH;

    for (const spec of specs) {
      const ml = spec.marginLeft ?? 0;
      const mr = spec.marginRight ?? 0;
      const mb = spec.marginBottom ?? 0;

      spec.container.y = y + mb;

      if (anchor === ANCHOR.BOTTOM_LEFT) {
        spec.container.x = safeLeft + DEFAULT_MARGIN + ml;
      } else if (anchor === ANCHOR.BOTTOM_RIGHT) {
        spec.container.x = vw - spec.width - safeRight - DEFAULT_MARGIN - mr;
      } else if (anchor === ANCHOR.BOTTOM_CENTER) {
        spec.container.x = (vw - spec.width) / 2;
      }

      spec.container.width = spec.width;
      spec.container.height = spec.height;
      y += spec.height + (spec.marginTop ?? 0) + mb + 1;
    }
  }

  private layoutCenter(anchor: Anchor, specs: PanelSpec[], vw: number, vh: number): void {
    for (const spec of specs) {
      if (anchor === ANCHOR.CENTER_LEFT) {
        spec.container.x = DEFAULT_MARGIN + (spec.marginLeft ?? 0);
        spec.container.y = (vh - spec.height) / 2;
      } else if (anchor === ANCHOR.CENTER_RIGHT) {
        spec.container.x = vw - spec.width - DEFAULT_MARGIN - (spec.marginRight ?? 0);
        spec.container.y = (vh - spec.height) / 2;
      } else if (anchor === ANCHOR.CENTER) {
        spec.container.x = (vw - spec.width) / 2;
        spec.container.y = (vh - spec.height) / 2;
      }
      spec.container.width = spec.width;
      spec.container.height = spec.height;
    }
  }
}
