#!/usr/bin/env node

import { Command } from 'commander';
import { AgentClient } from './AgentClient.js';
import { createInterface } from 'readline';
import { GameScreenState } from './types.js';

const program = new Command();

program
  .name('sdt-agent')
  .description('CLI for interacting with SPD Java test agent')
  .version('0.1.0');

// Default path
const defaultCwd = new URL('../../java', import.meta.url).pathname;

// === REPL mode (default) ===
program
  .command('repl')
  .description('Start interactive REPL session')
  .option('--cwd <path>', 'Java project directory', defaultCwd)
  .option('--java-cmd <cmd>', 'Java/gradle command', 'gradle')
  .action(async (opts) => {
    const client = new AgentClient({ cwd: opts.cwd, javaCmd: opts.javaCmd });
    try {
      console.log('Starting SPD Test Agent...');
      await client.start();
      console.log('Connected. Type "help" for commands.');
      await repl(client);
    } catch (e) {
      console.error('Error:', e);
      process.exit(1);
    } finally {
      await client.stop();
    }
  });

// === Single commands ===
program
  .command('read')
  .description('Read game screen state')
  .option('--pretty', 'Pretty-print JSON output')
  .option('--cwd <path>', 'Java project directory', defaultCwd)
  .option('--java-cmd <cmd>', 'Java/gradle command', 'gradle')
  .action(async (opts) => {
    const client = new AgentClient({ cwd: opts.cwd, javaCmd: opts.javaCmd });
    try {
      await client.start();
      const state = await client.read();
      const json = JSON.stringify(state, null, opts.pretty ? 2 : undefined);
      console.log(json);
    } finally {
      await client.stop();
    }
  });

program
  .command('init <seed> <hero>')
  .description('Initialize game with seed and hero class')
  .option('--cwd <path>', 'Java project directory', defaultCwd)
  .option('--java-cmd <cmd>', 'Java/gradle command', 'gradle')
  .action(async (seed, hero, opts) => {
    const client = new AgentClient({ cwd: opts.cwd, javaCmd: opts.javaCmd });
    try {
      await client.start();
      await client.init(seed, hero.toUpperCase());
      console.log(`Game initialized: seed=${seed}, hero=${hero}`);
    } finally {
      await client.stop();
    }
  });

program
  .command('click <x> <y>')
  .description('Click at coordinates')
  .option('--button <n>', 'Mouse button (0=left, 1=right, 2=middle)', '0')
  .option('--cwd <path>', 'Java project directory', defaultCwd)
  .option('--java-cmd <cmd>', 'Java/gradle command', 'gradle')
  .action(async (x, y, opts) => {
    const client = new AgentClient({ cwd: opts.cwd, javaCmd: opts.javaCmd });
    try {
      await client.start();
      await client.click(parseInt(x), parseInt(y), parseInt(opts.button));
      console.log(`Clicked at (${x}, ${y})`);
    } finally {
      await client.stop();
    }
  });

program
  .command('input <key>')
  .description('Send keyboard input')
  .option('--cwd <path>', 'Java project directory', defaultCwd)
  .option('--java-cmd <cmd>', 'Java/gradle command', 'gradle')
  .action(async (key, opts) => {
    const client = new AgentClient({ cwd: opts.cwd, javaCmd: opts.javaCmd });
    try {
      await client.start();
      await client.input(key);
      console.log(`Input: ${key}`);
    } finally {
      await client.stop();
    }
  });

program
  .command('wait <turns>')
  .description('Advance game turns')
  .option('--cwd <path>', 'Java project directory', defaultCwd)
  .option('--java-cmd <cmd>', 'Java/gradle command', 'gradle')
  .action(async (turns, opts) => {
    const client = new AgentClient({ cwd: opts.cwd, javaCmd: opts.javaCmd });
    try {
      await client.start();
      await client.wait(parseInt(turns));
      console.log(`Advanced ${turns} turns`);
    } finally {
      await client.stop();
    }
  });

program
  .command('script <file>')
  .description('Execute a test script from JSON file')
  .option('--cwd <path>', 'Java project directory', defaultCwd)
  .option('--java-cmd <cmd>', 'Java/gradle command', 'gradle')
  .action(async (file, opts) => {
    const client = new AgentClient({ cwd: opts.cwd, javaCmd: opts.javaCmd });
    try {
      await client.start();
      const results = await client.executeScript(file);
      for (const r of results) {
        console.log(`\n=== Checkpoint: ${r.label} ===`);
        console.log(JSON.stringify(r.state, null, 2));
      }
    } catch (e) {
      console.error('Script error:', e);
      process.exit(1);
    } finally {
      await client.stop();
    }
  });

// REPL interactive loop
async function repl(client: AgentClient) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'sdt> ',
  });

  rl.prompt();

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) { rl.prompt(); continue; }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'help':
          console.log(`
Commands:
  help                        Show this help
  read [--pretty]             Read game screen state
  init <seed> <hero>          Initialize game (hero: WARRIOR/MAGE/ROGUE/HUNTRESS/DUELIST/CLERIC)
  click <x> <y> [button]     Click at coordinates (button: 0=left, 1=right, 2=middle)
  click:id <elementId>        Click element by ID
  input <key>                 Send key press
  keycode <code>              Send key by code
  wait <turns>                Advance turns
  move <dx> <dy>              Move hero
  attack <dx> <dy>            Attack in direction
  script <file>               Run test script
  quit                        Exit
          `);
          break;

        case 'read': {
          const pretty = args.includes('--pretty');
          const state = await client.read();
          console.log(pretty ? JSON.stringify(state, null, 2) : JSON.stringify(state));
          break;
        }

        case 'init': {
          if (args.length < 2) { console.log('Usage: init <seed> <hero>'); break; }
          await client.init(args[0], args[1].toUpperCase());
          console.log(`Initialized: seed=${args[0]}, hero=${args[1]}`);
          break;
        }

        case 'click': {
          if (args.length < 2) { console.log('Usage: click <x> <y> [button]'); break; }
          const button = args.length > 2 ? parseInt(args[2]) : 0;
          await client.click(parseInt(args[0]), parseInt(args[1]), button);
          console.log(`Clicked (${args[0]}, ${args[1]})`);
          break;
        }

        case 'click:id': {
          if (args.length < 1) { console.log('Usage: click:id <elementId>'); break; }
          await client.clickElement(args[0]);
          console.log(`Clicked element: ${args[0]}`);
          break;
        }

        case 'input': {
          if (args.length < 1) { console.log('Usage: input <key>'); break; }
          await client.input(args[0].toUpperCase());
          console.log(`Input: ${args[0]}`);
          break;
        }

        case 'keycode': {
          if (args.length < 1) { console.log('Usage: keycode <code>'); break; }
          await client.inputKeycode(parseInt(args[0]));
          console.log(`Keycode: ${args[0]}`);
          break;
        }

        case 'wait': {
          if (args.length < 1) { console.log('Usage: wait <turns>'); break; }
          await client.wait(parseInt(args[0]));
          console.log(`Waited ${args[0]} turns`);
          break;
        }

        case 'move': {
          if (args.length < 2) { console.log('Usage: move <dx> <dy>'); break; }
          await client.move(parseInt(args[0]), parseInt(args[1]));
          console.log(`Moved (${args[0]}, ${args[1]})`);
          break;
        }

        case 'attack': {
          if (args.length < 2) { console.log('Usage: attack <dx> <dy>'); break; }
          await client.attack(parseInt(args[0]), parseInt(args[1]));
          console.log(`Attacked (${args[0]}, ${args[1]})`);
          break;
        }

        case 'script': {
          if (args.length < 1) { console.log('Usage: script <file>'); break; }
          const results = await client.executeScript(args[0]);
          for (const r of results) {
            console.log(`\n=== Checkpoint: ${r.label} ===`);
            console.log(JSON.stringify(r.state, null, 2));
          }
          break;
        }

        case 'quit':
        case 'exit':
          console.log('Goodbye!');
          rl.close();
          return;

        default:
          console.log(`Unknown command: ${cmd}. Type "help" for available commands.`);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Error: ${message}`);
    }

    rl.prompt();
  }
}

program.parse(process.argv);
