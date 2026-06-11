import { Container } from 'pixi.js';
import { makeText } from './text';
import { GLog } from './GLog';

const MAX_LINES = 4;
const LINE_HEIGHT = 7;
const FONT_SIZE = 5;

interface Entry {
  text: string;
  color: string;
}

export class GameLog extends Container {
  private entries: Entry[] = [];
  private lines: Entry[] = [];
  private textsToAdd: string[] = [];

  constructor() {
    super();
    this.eventMode = 'none';

    GLog.update.add((msg: string) => {
      if (msg === '__WIPE__') {
        this.wipe();
      } else {
        this.textsToAdd.push(msg);
      }
    });
  }

  private updateLog(): void {
    while (this.textsToAdd.length > 0) {
      const msg = this.textsToAdd.shift()!;
      let color = '#ffffff';
      if (msg.startsWith('@@')) {
        color = GLog.POSITIVE;
      } else if (msg.startsWith('##')) {
        color = GLog.WARNING;
      } else if (msg.startsWith('!!')) {
        color = GLog.NEGATIVE;
      }
      this.entries.push({ text: msg, color });
    }

    this.lines = [];
    for (const entry of this.entries) {
      const last = this.lines[this.lines.length - 1];
      if (last && last.color === entry.color && this.lines.length > 0) {
        last.text += ' ' + entry.text;
      } else {
        this.lines.push({ ...entry });
      }
    }

    if (this.lines.length > MAX_LINES) {
      this.lines = this.lines.slice(this.lines.length - MAX_LINES);
    }

    this.render();
  }

  private render(): void {
    this.removeChildren();

    const startY = -this.lines.length * LINE_HEIGHT;
    for (let i = 0; i < this.lines.length; i++) {
      const entry = this.lines[i]!;
      const t = makeText({ text: entry.text, size: FONT_SIZE, fill: entry.color });
      t.x = 0;
      t.y = startY + i * LINE_HEIGHT;
      this.addChild(t);
    }
  }

  update(): void {
    this.updateLog();
  }

  wipe(): void {
    this.entries = [];
    this.lines = [];
    this.textsToAdd = [];
    this.removeChildren();
  }
}
