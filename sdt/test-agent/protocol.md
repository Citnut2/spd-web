# SDT Test Agent Protocol v1.0

## Overview

The SDT (Shattered Dungeon Test) Agent protocol enables a CLI to drive a headless Java instance of Shattered Pixel Dungeon via JSON messages over stdin/stdout. Each line is a complete, self-contained JSON object. The CLI sends commands to the Java process on stdin; the Java process replies on stdout.

## Transport

- **Encoding:** UTF-8 text lines, each terminated by `\n`
- **Framing:** one JSON object per line (newline-delimited JSON, NDJSON)
- **Request/response matching:** every request carries an integer `id`; the corresponding response echoes the same `id`
- **Ordering:** the Java process responds strictly in order — no pipelining required
- **Startup:** the CLI spawns the Java process and begins sending commands immediately; the agent is ready once it prints its first prompt or waits for input

## Requests

Every request is a JSON object with at minimum `id` and `cmd` fields. Some commands require a `params` sub-object.

```json
{"id": 1, "cmd": "read"}
{"id": 2, "cmd": "click", "params": {"x": 100, "y": 200}}
{"id": 3, "cmd": "click", "params": {"element": "btn_start"}}
{"id": 4, "cmd": "input", "params": {"key": "A"}}
{"id": 5, "cmd": "input", "params": {"keycode": 61}}
{"id": 6, "cmd": "init", "params": {"seed": "TEST-ABC", "hero": "WARRIOR"}}
{"id": 7, "cmd": "wait", "params": {"turns": 2}}
{"id": 8, "cmd": "move", "params": {"dx": 0, "dy": -1}}
{"id": 9, "cmd": "attack", "params": {"dx": 0, "dy": -1}}
{"id": 10, "cmd": "quit"}
```

## Responses

Every response is a JSON object with at minimum `id` and `ok` fields. Successful responses additionally carry a `type` field to distinguish the payload shape. Failed responses carry an `error` string.

```json
{"id": 1, "ok": true, "type": "state", "data": { ... }}
{"id": 2, "ok": true, "type": "ack"}
{"id": 10, "ok": true, "type": "exit"}
{"id": 99, "ok": false, "error": "unrecognized command: jump"}
```

| Response Type | Meaning |
|---------------|---------|
| `state`       | Contains a full game state + scene graph snapshot in `data` |
| `ack`         | Command was executed successfully, no payload |
| `exit`        | Process is shutting down gracefully |
| (absent)      | `ok: false` — see `error` field for details |

## Command Reference

### `read`
Returns the current game state and scene graph.

- **Params:** none
- **Response:** `{"ok": true, "type": "state", "data": {...}}`

---

### `click`
Simulates a pointer click.

| Param     | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| `x`       | number |          | —       | Viewport x-coordinate |
| `y`       | number |          | —       | Viewport y-coordinate |
| `button`  | number |          | `0`     | Mouse button (0=left, 1=right, 2=middle) |
| `element` | string |          | —       | Named element ID to click (alternative to x/y) |

If `element` is provided, the agent resolves its bounding box from the scene graph and clicks its center. If `x`/`y` are provided, those viewport coordinates are used directly.

- **Response:** `{"ok": true, "type": "ack"}`

---

### `input`
Sends a keyboard event to the active LibGDX input processor.

| Param     | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| `key`     | string |          | —       | Key name, e.g. `"A"`, `"SPACE"`, `"ENTER"`, `"ESCAPE"` |
| `keycode` | number |          | —       | Raw LibGDX `Input.Keys` constant |

Exactly one of `key` or `keycode` must be provided. The `key` string is converted to the corresponding `Keys` constant on the Java side (case-insensitive).

- **Response:** `{"ok": true, "type": "ack"}`

---

### `init`
Initializes a new game with a deterministic seed and hero class.

| Param  | Type   | Required | Default | Description |
|--------|--------|----------|---------|-------------|
| `seed` | string | yes      | —       | RNG seed for deterministic play |
| `hero` | string | yes      | —       | Hero class: `WARRIOR`, `MAGE`, `ROGUE`, `HUNTRESS`, `DUELIST`, `CLERIC` |

This restarts the game world. The response includes the initial game state.

- **Response:** `{"ok": true, "type": "state", "data": {...}}`

---

### `wait`
Advances the game by a given number of turns.

| Param   | Type   | Required | Default | Description |
|---------|--------|----------|---------|-------------|
| `turns` | number | yes      | —       | Number of game turns to advance (must be ≥ 1) |

The agent processes the specified number of actor ticks and returns once they complete.

- **Response:** `{"ok": true, "type": "ack"}`

---

### `move`
Moves the hero by a direction offset relative to its current position.

| Param | Type   | Required | Default | Description |
|-------|--------|----------|---------|-------------|
| `dx`  | number | yes      | —       | Column offset (-1, 0, or 1) |
| `dy`  | number | yes      | —       | Row offset (-1, 0, or 1) |

The direction integer pair follows SPD conventions: (0, -1) = up, (0, 1) = down, (-1, 0) = left, (1, 0) = right. Diagonal moves are accepted but will be handled by the game's pathfinding.

- **Response:** `{"ok": true, "type": "ack"}`

---

### `attack`
Initiates a melee attack from the hero toward a cell offset.

| Param | Type   | Required | Default | Description |
|-------|--------|----------|---------|-------------|
| `dx`  | number | yes      | —       | Column offset to target |
| `dy`  | number | yes      | —       | Row offset to target |

The agent performs a melee attack on whatever occupies the cell at the hero's position plus the offset.

- **Response:** `{"ok": true, "type": "ack"}`

---

### `quit`
Instructs the Java process to shut down cleanly.

- **Params:** none
- **Response:** `{"ok": true, "type": "exit"}`

After sending this response, the Java process closes stdin/stdout and exits with code 0.

## State Response Schema

When `type` is `"state"`, the `data` object contains two top-level sections: `game` (logical game state) and `scene` (visual scene graph).

### Game State

| Field | Type | Description |
|-------|------|-------------|
| `seed` | string | The RNG seed used for this game |
| `depth` | number | Current dungeon depth (1-indexed) |
| `turn` | number | Current game turn counter |
| `checkpoint` | number | Last save checkpoint depth |
| `rngCalls` | number | Total RNG calls made since init |

**Hero:**
| Field | Type | Description |
|-------|------|-------------|
| `hero.pos` | `{x, y}` | Hero's current cell coordinates |
| `hero.HP` | number | Current hit points |
| `hero.HT` | number | Maximum hit points |
| `hero.STR` | number | Strength score |
| `hero.class` | string | Hero class string (e.g. `"WARRIOR"`) |
| `hero.level` | number | Current character level |
| `hero.XP` | number | Current experience points |
| `hero.weapon` | object\|null | Equipped weapon item data |
| `hero.armor` | object\|null | Equipped armor item data |
| `hero.ring` | object\|null | Equipped ring item data |
| `hero.artifact` | object\|null | Equipped artifact item data |
| `hero.inventory` | array | Array of item objects in backpack |

**Level:**
| Field | Type | Description |
|-------|------|-------------|
| `level.width` | number | Level width in tiles |
| `level.height` | number | Level height in tiles |
| `level.entrance` | `{x, y}` | Entry cell coordinates |
| `level.exit` | `{x, y}` | Exit cell coordinates |
| `level.terrain` | array | Flattened terrain array (row-major), each entry is a terrain type integer |
| `level.mobs` | array | Array of mob objects currently on the level |
| `level.heaps` | array | Array of heap (item pile) objects on the ground |

Each **mob object** contains: `id`, `type` (sprite ID), `pos`, `HP`, `HT`, `state` (e.g. `"WANDERING"`, `"HUNTING"`, `"SLEEPING"`), `alerted`, `enemyPos`.

Each **heap object** contains: `pos`, `items` (array of item objects), `autoExplored`.

Each **item object** contains: `type` (item class name), `quantity`, `level` (upgrade level), `identified`, `cursed`, `equipped`.

### Scene Graph

| Field | Type | Description |
|-------|------|-------------|
| `scene.type` | string | Active scene key, e.g. `"title"`, `"heroSelect"`, `"game"` |
| `scene.camera` | object | Primary camera properties: `zoom`, `width`, `height`, `scrollX`, `scrollY`, `screenWidth`, `screenHeight` |
| `scene.cameras` | array | Array of all camera objects (same schema as above) |
| `scene.elements` | array | Visible UI elements (see below) |

Each **element** in `elements`:
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique element identifier |
| `type` | string | Renderable type: `"Image"`, `"BitmapText"`, `"Group"`, `"Visual"` |
| `x` | number | X position in screen/canvas coordinates |
| `y` | number | Y position |
| `width` | number | Element width |
| `height` | number | Element height |
| `scaleX` | number | Horizontal scale factor |
| `scaleY` | number | Vertical scale factor |
| `angle` | number | Rotation angle in degrees |
| `visible` | boolean | Whether the element is currently visible |
| `camera` | string\|null | Camera this element belongs to |
| `tint` | string\|null | CSS-style tint color, e.g. `"#ff0000"` |
| `texture` | string | *(Image only)* Asset path within the APK assets, e.g. `"sprites/hero.png"` |
| `frame` | object | *(Image only)* Sprite-sheet UV region: `{x, y, width, height}` in pixels |
| `text` | string | *(BitmapText only)* The displayed text content |
| `font` | string | *(BitmapText only)* Font asset path |

## Example Session

The following is a complete CLI → agent interaction from process spawn to exit.

```
→ {"id": 1, "cmd": "init", "params": {"seed": "FIXED-1234", "hero": "WARRIOR"}}
← {"id": 1, "ok": true, "type": "state", "data": {
    "game": {
      "seed": "FIXED-1234",
      "depth": 1,
      "turn": 0,
      "checkpoint": 0,
      "rngCalls": 47,
      "hero": {
        "pos": {"x": 12, "y": 15},
        "HP": 20, "HT": 20, "STR": 10,
        "class": "WARRIOR", "level": 1, "XP": 0,
        "weapon": null,
        "armor": null,
        "ring": null,
        "artifact": null,
        "inventory": [{"type": "Bomb", "quantity": 1, "level": 0, "identified": true, "cursed": false, "equipped": false}]
      },
      "level": {
        "width": 32, "height": 32,
        "entrance": {"x": 12, "y": 15},
        "exit": {"x": 28, "y": 3},
        "terrain": [0,0,0,0,0,0,0,0,0,0,...],
        "mobs": [{"id": 0, "type": "RAT", "pos": {"x": 14, "y": 12}, "HP": 8, "HT": 8, "state": "WANDERING", "alerted": false, "enemyPos": null}],
        "heaps": [{"pos": {"x": 5, "y": 5}, "items": [{"type": "Gold", "quantity": 12, "level": 0, "identified": true, "cursed": false, "equipped": false}], "autoExplored": false}]
      }
    },
    "scene": {
      "type": "game",
      "camera": {"zoom": 3, "width": 480, "height": 432, "scrollX": 0, "scrollY": 0, "screenWidth": 480, "screenHeight": 432},
      "cameras": [{"zoom": 3, "width": 480, "height": 432, "scrollX": 0, "scrollY": 0, "screenWidth": 480, "screenHeight": 432}],
      "elements": [
        {"id": "btn_wait", "type": "Image", "x": 400, "y": 380, "width": 64, "height": 32, "scaleX": 1, "scaleY": 1, "angle": 0, "visible": true, "camera": null, "tint": null, "texture": "ui/buttons/wait.png", "frame": {"x": 0, "y": 0, "width": 64, "height": 32}},
        {"id": "hp_label", "type": "BitmapText", "x": 10, "y": 390, "width": 100, "height": 20, "scaleX": 1, "scaleY": 1, "angle": 0, "visible": true, "camera": null, "tint": null, "text": "HP: 20/20", "font": "fonts/pixel.fnt"}
      ]
    }
  }}

→ {"id": 2, "cmd": "wait", "params": {"turns": 1}}
← {"id": 2, "ok": true, "type": "ack"}

→ {"id": 3, "cmd": "read"}
← {"id": 3, "ok": true, "type": "state", "data": {
    "game": {"seed": "FIXED-1234", "depth": 1, "turn": 1, ...},
    "scene": {...}
  }}

→ {"id": 4, "cmd": "move", "params": {"dx": 1, "dy": 0}}
← {"id": 4, "ok": true, "type": "ack"}

→ {"id": 5, "cmd": "attack", "params": {"dx": 1, "dy": -1}}
← {"id": 5, "ok": true, "type": "ack"}

→ {"id": 6, "cmd": "quit"}
← {"id": 6, "ok": true, "type": "exit"}
```

## Error Handling

- All errors are reported with `{"ok": false, "error": "human-readable message"}`
- Common error scenarios:
  - **Unknown command:** `"unrecognized command: <cmd>"`
  - **Missing required param:** `"missing required parameter: <param>"`
  - **Invalid param value:** `"invalid value for <param>: <value>"`
  - **Game not initialized:** `"no active game — send init first"` (for commands that require a game)
  - **Agent busy:** `"agent is busy processing previous command"` (should not occur if client observes ordering)
- **Timeouts:** The CLI is responsible for enforcing a timeout (default 30 seconds). If the Java process does not respond within the timeout, the CLI should kill the process and report failure.
- **Process death:** If the Java process exits unexpectedly, the CLI must reject all pending requests with an appropriate error.
- **Malformed JSON:** If the agent receives a line that is not valid JSON, it responds with `{"id": null, "ok": false, "error": "malformed JSON"}` and continues reading the next line.

## Versioning

This document describes version 1.0 of the protocol. Backwards-incompatible changes will increment the major version number. The agent may advertise its protocol version on startup via a `{"type": "hello", "version": 1}` message before processing commands.
