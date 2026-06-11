import { spawn, ChildProcess } from 'child_process';
import { createInterface, Interface as ReadlineInterface } from 'readline';
import { Response, GameScreenState, AgentOptions } from './types.js';

export class AgentClient {
  private process: ChildProcess | null = null;
  private rl: ReadlineInterface | null = null;
  private pending = new Map<number, { resolve: (r: Response) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();
  private nextId = 1;
  private options: Required<AgentOptions>;

  static readonly DEFAULT_OPTIONS: Required<AgentOptions> = {
    javaCmd: 'gradle',
    jarPath: '',
    cwd: '',
  };

  constructor(opts: AgentOptions = {}) {
    this.options = { ...AgentClient.DEFAULT_OPTIONS, ...opts };
  }

  async start(): Promise<void> {
    const args: string[] = [];
    if (this.options.jarPath) {
      args.push('-jar', this.options.jarPath);
    } else {
      args.push('run', '--console=plain', '-q');
    }

    this.process = spawn(this.options.javaCmd, args, {
      cwd: this.options.cwd || undefined,
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    this.rl = createInterface({
      input: this.process.stdout!,
      crlfDelay: Infinity,
    });

    this.rl.on('line', (line: string) => {
      try {
        const resp: Response = JSON.parse(line);
        const pending = this.pending.get(resp.id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(resp.id);
          pending.resolve(resp);
        }
      } catch {
        // Ignore non-JSON output (e.g. gradle logs before app starts)
      }
    });

    this.process.on('exit', (code) => {
      for (const [id, pending] of this.pending) {
        clearTimeout(pending.timer);
        this.pending.delete(id);
        pending.reject(new Error(`Process exited with code ${code}`));
      }
    });

    // Wait for process to be ready (first data on stdout)
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout waiting for process')), 30000);
      this.process!.stdout!.once('data', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.sendCommand('quit');
      await new Promise<void>((resolve) => {
        this.process!.once('exit', () => resolve());
        setTimeout(() => {
          this.process!.kill();
          resolve();
        }, 5000);
      });
      this.process = null;
    }
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  async sendCommand(cmd: string, params?: Record<string, unknown>): Promise<Response> {
    const id = this.nextId++;
    const msg = JSON.stringify({ id, cmd, params }) + '\n';

    return new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout for command '${cmd}' (id=${id})`));
      }, 30000);

      this.pending.set(id, { resolve, reject, timer });
      this.process!.stdin!.write(msg);
    });
  }

  async read(): Promise<GameScreenState> {
    const resp = await this.sendCommand('read');
    if (!resp.ok) throw new Error(`read failed: ${resp.error}`);
    return resp.data as GameScreenState;
  }

  async click(x: number, y: number, button?: number): Promise<void> {
    const resp = await this.sendCommand('click', { x, y, button: button ?? 0 });
    if (!resp.ok) throw new Error(`click failed: ${resp.error}`);
  }

  async clickElement(elementId: string): Promise<void> {
    const state = await this.read();
    const element = state.scene.elements.find(e => e.id === elementId);
    if (!element) throw new Error(`Element not found: ${elementId}`);
    const cx = element.x + element.width / 2;
    const cy = element.y + element.height / 2;
    await this.click(cx, cy);
  }

  async input(key: string): Promise<void> {
    const resp = await this.sendCommand('input', { key });
    if (!resp.ok) throw new Error(`input failed: ${resp.error}`);
  }

  async inputKeycode(keycode: number): Promise<void> {
    const resp = await this.sendCommand('input', { keycode });
    if (!resp.ok) throw new Error(`input keycode failed: ${resp.error}`);
  }

  async init(seed: string, heroClass: string): Promise<void> {
    const resp = await this.sendCommand('init', { seed, hero: heroClass });
    if (!resp.ok) throw new Error(`init failed: ${resp.error}`);
  }

  async wait(turns: number): Promise<void> {
    const resp = await this.sendCommand('wait', { turns });
    if (!resp.ok) throw new Error(`wait failed: ${resp.error}`);
  }

  async move(dx: number, dy: number): Promise<void> {
    const resp = await this.sendCommand('move', { dx, dy });
    if (!resp.ok) throw new Error(`move failed: ${resp.error}`);
  }

  async attack(dx: number, dy: number): Promise<void> {
    const resp = await this.sendCommand('attack', { dx, dy });
    if (!resp.ok) throw new Error(`attack failed: ${resp.error}`);
  }

  async executeScript(scriptPath: string): Promise<{ label: string; state: GameScreenState }[]> {
    const { readFileSync } = await import('fs');
    const content = readFileSync(scriptPath, 'utf-8');
    const script: { cmd: string; params?: Record<string, unknown>; label?: string }[] = JSON.parse(content);
    const results: { label: string; state: GameScreenState }[] = [];

    for (const action of script) {
      if (action.cmd === 'read') {
        const state = await this.read();
        results.push({ label: action.label || 'unnamed', state });
      } else {
        await this.sendCommand(action.cmd, action.params);
      }
    }

    return results;
  }
}
