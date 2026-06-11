package com.sdt.testagent;

import com.badlogic.gdx.Input;
import com.shatteredpixel.shatteredpixeldungeon.Dungeon;
import com.shatteredpixel.shatteredpixeldungeon.GamesInProgress;
import com.shatteredpixel.shatteredpixeldungeon.actors.Actor;
import com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass;
import com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob;
import com.shatteredpixel.shatteredpixeldungeon.levels.Level;
import com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene;
import com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed;
import com.watabou.noosa.Game;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class TestAgentServer implements Runnable {

    private final BufferedReader stdin;
    private final PrintWriter stdout;
    private final BlockingQueue<JSONObject> commandQueue;

    public TestAgentServer() {
        this.stdin = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        this.stdout = new PrintWriter(new OutputStreamWriter(System.out, StandardCharsets.UTF_8), true);
        this.commandQueue = new LinkedBlockingQueue<>();
    }

    @Override
    public void run() {
        try {
            String line;
            while ((line = stdin.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                try {
                    JSONObject cmd = new JSONObject(line);
                    String command = cmd.optString("cmd", "");
                    if ("quit".equals(command)) {
                        System.exit(0);
                    }
                    commandQueue.add(cmd);
                } catch (Exception e) {
                    JSONObject err = new JSONObject();
                    err.put("id", JSONObject.NULL);
                    err.put("ok", false);
                    err.put("error", "Failed to parse command: " + e.getMessage());
                    stdout.println(err.toString());
                }
            }
        } catch (Exception e) {
            System.err.println("TestAgentServer input error: " + e.getMessage());
        }
    }

    public void processPending() {
        JSONObject cmd;
        while ((cmd = commandQueue.poll()) != null) {
            try {
                int id = cmd.optInt("id", -1);
                String command = cmd.optString("cmd", "");
                JSONObject params = cmd.optJSONObject("params");
                if (params == null) params = new JSONObject();

                switch (command) {
                    case "read":
                        handleRead(id);
                        break;
                    case "click":
                        handleClick(id, params);
                        break;
                    case "input":
                        handleInput(id, params);
                        break;
                    case "init":
                        handleInit(id, params);
                        break;
                    case "wait":
                        handleWait(id, params);
                        break;
                    case "move":
                        handleMove(id, params);
                        break;
                    case "attack":
                        handleAttack(id, params);
                        break;
                    default:
                        sendError(id, "Unknown command: " + command);
                }
            } catch (Exception e) {
                int id = cmd.optInt("id", -1);
                sendError(id, "Error processing command: " + e.getMessage());
            }
        }
    }

    private void handleRead(int id) {
        JSONObject gameState = GameStateDumper.dumpState("read");
        JSONObject sceneGraph = SceneGraphDumper.dumpScene();

        JSONObject data = new JSONObject();
        data.put("game", gameState);
        data.put("scene", sceneGraph);

        sendResponse(id, data);
    }

    private void handleClick(int id, JSONObject params) {
        if (params.has("x") && params.has("y")) {
            int x = params.getInt("x");
            int y = params.getInt("y");
            int button = params.optInt("button", 0);
            InputSimulator.click(x, y, button);
            sendAck(id);
        } else if (params.has("element")) {
            String elementId = params.getString("element");
            clickElementById(elementId);
            sendAck(id);
        } else {
            sendError(id, "click requires 'x' and 'y' or 'element'");
        }
    }

    private void clickElementById(String elementId) {
        JSONObject scene = SceneGraphDumper.dumpScene();
        JSONArray elements = scene.optJSONArray("elements");
        if (elements == null) return;

        for (int i = 0; i < elements.length(); i++) {
            JSONObject el = elements.optJSONObject(i);
            if (el != null && elementId.equals(el.optString("id", ""))) {
                float ex = (float) el.optDouble("x", 0);
                float ey = (float) el.optDouble("y", 0);
                float ew = (float) el.optDouble("width", 0);
                float eh = (float) el.optDouble("height", 0);
                int cx = (int) (ex + ew / 2);
                int cy = (int) (ey + eh / 2);
                InputSimulator.click(cx, cy, 0);
                return;
            }
        }
        System.err.println("Element not found in scene graph: " + elementId);
    }

    private void handleInput(int id, JSONObject params) {
        if (params.has("key")) {
            String key = params.getString("key");
            try {
                InputSimulator.keyPress(key);
                sendAck(id);
            } catch (IllegalArgumentException e) {
                sendError(id, "Unknown key name: " + key);
            }
        } else if (params.has("keycode")) {
            int keyCode = params.getInt("keycode");
            InputSimulator.keyPress(keyCode);
            sendAck(id);
        } else {
            sendError(id, "input requires 'key' (string) or 'keycode' (int)");
        }
    }

    private void handleInit(int id, JSONObject params) {
        try {
            String seedText = params.optString("seed", "TEST-ABC");
            String heroStr = params.optString("hero", "WARRIOR");

            HeroClass heroClass = parseHeroClass(heroStr);

            long seed;
            if (seedText.matches("\\d+")) {
                seed = Long.parseLong(seedText);
            } else {
                Dungeon.customSeedText = seedText;
                seed = DungeonSeed.convertFromText(seedText);
            }

            GamesInProgress.selectedClass = heroClass;
            Dungeon.seed = seed;
            Dungeon.init();

            Level level = Dungeon.newLevel();
            Dungeon.level = level;
            Dungeon.hero.pos = level.entrance();

            level.heroFOV = new boolean[level.length()];
            level.updateFieldOfView();

            Game.switchScene(GameScene.class);

            sendAck(id);
        } catch (Exception e) {
            sendError(id, "Failed to init game: " + e.getMessage());
        }
    }

    private void handleWait(int id, JSONObject params) {
        int turns = params.optInt("turns", 1);
        for (int i = 0; i < turns; i++) {
            Actor.process();
        }
        sendAck(id);
    }

    private void handleMove(int id, JSONObject params) {
        int dx = params.getInt("dx");
        int dy = params.getInt("dy");
        int targetCell = Dungeon.hero.pos + dx + dy * Dungeon.level.width();

        if (Dungeon.level.avoid[targetCell]) {
            sendError(id, "Cannot move: terrain is avoided");
        } else if (Dungeon.level.passable[targetCell] && Dungeon.level.mobs.get(targetCell) == null) {
            Dungeon.hero.pos = targetCell;
            Dungeon.level.updateFieldOfView();
            sendAck(id);
        } else {
            sendError(id, "Cannot move to target cell (blocked or occupied)");
        }
    }

    private void handleAttack(int id, JSONObject params) {
        int dx = params.getInt("dx");
        int dy = params.getInt("dy");
        int targetCell = Dungeon.hero.pos + dx + dy * Dungeon.level.width();
        Mob target = (Mob) Dungeon.level.mobs.get(targetCell);
        if (target != null && target.isAlive()) {
            Dungeon.hero.attack(target);
            sendAck(id);
        } else {
            sendError(id, "No alive mob at target cell");
        }
    }

    private void sendResponse(int id, JSONObject data) {
        JSONObject resp = new JSONObject();
        resp.put("id", id);
        resp.put("ok", true);
        resp.put("type", "state");
        resp.put("data", data);
        stdout.println(resp.toString());
    }

    private void sendAck(int id) {
        JSONObject resp = new JSONObject();
        resp.put("id", id);
        resp.put("ok", true);
        resp.put("type", "ack");
        stdout.println(resp.toString());
    }

    private void sendError(int id, String msg) {
        JSONObject resp = new JSONObject();
        resp.put("id", id);
        resp.put("ok", false);
        resp.put("error", msg);
        stdout.println(resp.toString());
    }

    private static HeroClass parseHeroClass(String s) {
        switch (s.toUpperCase()) {
            case "WARRIOR":  return HeroClass.WARRIOR;
            case "MAGE":     return HeroClass.MAGE;
            case "ROGUE":    return HeroClass.ROGUE;
            case "HUNTRESS": return HeroClass.HUNTRESS;
            case "DUELIST":  return HeroClass.DUELIST;
            case "CLERIC":   return HeroClass.CLERIC;
            default:
                return HeroClass.WARRIOR;
        }
    }
}
